"""
TVBuddy - Isometric Action RPG
A dungeon-crawler game with 3 character classes and procedural dungeons
"""

import pygame
import random
import math
from enum import Enum

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
FPS = 60
TILE_SIZE = 32

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
DARK_GRAY = (64, 64, 64)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
ORANGE = (255, 165, 0)
CYAN = (0, 255, 255)
BROWN = (139, 69, 19)
DARK_RED = (139, 0, 0)
GOLD = (255, 215, 0)


class GameState(Enum):
    MENU = 1
    PLAYING = 2
    LEVEL_COMPLETE = 3
    GAME_OVER = 4
    VICTORY = 5


class Projectile(pygame.sprite.Sprite):
    """Projectile class for ranged attacks"""

    def __init__(self, x, y, target_x, target_y, damage, speed, color, owner):
        super().__init__()
        self.image = pygame.Surface((8, 8))
        self.image.fill(color)
        self.rect = self.image.get_rect(center=(x, y))
        self.damage = damage
        self.speed = speed
        self.owner = owner

        # Calculate direction
        dx = target_x - x
        dy = target_y - y
        distance = math.sqrt(dx**2 + dy**2)
        if distance > 0:
            self.vel_x = (dx / distance) * speed
            self.vel_y = (dy / distance) * speed
        else:
            self.vel_x = 0
            self.vel_y = 0

    def update(self):
        self.rect.x += self.vel_x
        self.rect.y += self.vel_y

        # Remove if off screen
        if (self.rect.x < 0 or self.rect.x > SCREEN_WIDTH or
            self.rect.y < 0 or self.rect.y > SCREEN_HEIGHT):
            self.kill()


class Player(pygame.sprite.Sprite):
    """Base Player class"""

    def __init__(self, x, y, char_class):
        super().__init__()
        self.char_class = char_class

        # Stats based on class
        if char_class == "Warrior":
            self.max_hp = 150
            self.base_damage = 25
            self.attack_speed = 1.5
            self.speed = 3
            self.resource_max = 100  # Stamina
            self.resource_name = "Stamina"
            self.color = RED
            self.is_ranged = False
        elif char_class == "Ranger":
            self.max_hp = 100
            self.base_damage = 15
            self.attack_speed = 1.0
            self.speed = 4
            self.resource_max = 100  # Stamina
            self.resource_name = "Stamina"
            self.color = GREEN
            self.is_ranged = True
        else:  # Wizard
            self.max_hp = 75
            self.base_damage = 12
            self.attack_speed = 0.5
            self.speed = 3.5
            self.resource_max = 100  # Mana
            self.resource_name = "Mana"
            self.color = BLUE
            self.is_ranged = True
            self.mana_regen = 2  # per second

        self.hp = self.max_hp
        self.resource = self.resource_max
        self.damage = self.base_damage
        self.level = 1
        self.xp = 0
        self.xp_to_next = 100

        # Create sprite
        self.image = pygame.Surface((TILE_SIZE, TILE_SIZE))
        self.image.fill(self.color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

        # Attack cooldown
        self.last_attack = 0

    def update(self, keys, walls):
        """Update player position based on input"""
        old_x, old_y = self.rect.x, self.rect.y

        # Movement
        if keys[pygame.K_w]:
            self.rect.y -= self.speed
        if keys[pygame.K_s]:
            self.rect.y += self.speed
        if keys[pygame.K_a]:
            self.rect.x -= self.speed
        if keys[pygame.K_d]:
            self.rect.x += self.speed

        # Collision with walls
        for wall in walls:
            if self.rect.colliderect(wall.rect):
                self.rect.x, self.rect.y = old_x, old_y
                break

        # Keep on screen
        self.rect.clamp_ip(pygame.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT))

        # Mana regeneration for Wizard
        if self.char_class == "Wizard":
            self.resource = min(self.resource_max, self.resource + self.mana_regen / FPS)

    def attack(self, mouse_pos):
        """Create projectile or melee attack"""
        current_time = pygame.time.get_ticks() / 1000.0

        if current_time - self.last_attack < self.attack_speed:
            return None

        # Check resource
        resource_cost = 10
        if self.resource < resource_cost:
            return None

        self.resource -= resource_cost
        self.last_attack = current_time

        if self.is_ranged:
            return Projectile(self.rect.centerx, self.rect.centery,
                            mouse_pos[0], mouse_pos[1],
                            self.damage, 10, self.color, "player")
        else:
            # Melee attack - short range projectile
            return Projectile(self.rect.centerx, self.rect.centery,
                            mouse_pos[0], mouse_pos[1],
                            self.damage, 15, self.color, "player")

    def gain_xp(self, amount):
        """Add XP and handle leveling"""
        self.xp += amount
        while self.xp >= self.xp_to_next:
            self.level_up()

    def level_up(self):
        """Increase stats on level up"""
        self.xp -= self.xp_to_next
        self.level += 1
        self.xp_to_next = 100 * self.level

        # Increase stats
        self.max_hp += 15
        self.hp = min(self.max_hp, self.hp + 15)
        self.damage += 3

    def take_damage(self, amount):
        """Take damage"""
        self.hp -= amount
        if self.hp <= 0:
            self.hp = 0
            return True  # Dead
        return False


class Enemy(pygame.sprite.Sprite):
    """Enemy class"""

    def __init__(self, x, y, floor_level, is_boss=False):
        super().__init__()
        self.is_boss = is_boss

        # Scale stats based on floor
        if is_boss:
            self.max_hp = 500
            self.damage = 30
            self.speed = 2
            self.xp_value = 200
            self.color = PURPLE
            size = TILE_SIZE * 2
        else:
            base_hp = 30 + (floor_level - 1) * 30
            self.max_hp = random.randint(base_hp, base_hp + 20)
            self.damage = 5 + (floor_level - 1) * 5
            self.speed = 1 + floor_level * 0.5
            self.xp_value = 25 * floor_level
            self.color = ORANGE if floor_level < 3 else DARK_RED
            size = TILE_SIZE

        self.hp = self.max_hp

        # Create sprite
        self.image = pygame.Surface((size, size))
        self.image.fill(self.color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

        # AI
        self.last_attack = 0
        self.attack_cooldown = 2.0

    def update(self, player, walls):
        """Simple AI - move towards player"""
        # Calculate direction to player
        dx = player.rect.centerx - self.rect.centerx
        dy = player.rect.centery - self.rect.centery
        distance = math.sqrt(dx**2 + dy**2)

        if distance > 0 and distance > 50:  # Move if not too close
            old_x, old_y = self.rect.x, self.rect.y

            self.rect.x += (dx / distance) * self.speed
            self.rect.y += (dy / distance) * self.speed

            # Check wall collision
            for wall in walls:
                if self.rect.colliderect(wall.rect):
                    self.rect.x, self.rect.y = old_x, old_y
                    break

    def attack_player(self, player):
        """Attack player if in range"""
        current_time = pygame.time.get_ticks() / 1000.0

        if current_time - self.last_attack < self.attack_cooldown:
            return None

        distance = math.sqrt((player.rect.centerx - self.rect.centerx)**2 +
                           (player.rect.centery - self.rect.centery)**2)

        if distance < 150:  # Attack range
            self.last_attack = current_time
            return Projectile(self.rect.centerx, self.rect.centery,
                            player.rect.centerx, player.rect.centery,
                            self.damage, 5, self.color, "enemy")
        return None

    def take_damage(self, amount):
        """Take damage"""
        self.hp -= amount
        if self.hp <= 0:
            return True  # Dead
        return False


class Wall(pygame.sprite.Sprite):
    """Wall obstacle"""

    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((TILE_SIZE, TILE_SIZE))
        self.image.fill(DARK_GRAY)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y


class Chest(pygame.sprite.Sprite):
    """Loot chest"""

    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((TILE_SIZE, TILE_SIZE))
        self.image.fill(GOLD)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.opened = False

    def open(self, player):
        """Open chest and grant loot"""
        if not self.opened:
            self.opened = True
            self.image.fill(BROWN)

            # Random stat boost
            loot_type = random.choice(["hp", "damage", "xp"])
            if loot_type == "hp":
                boost = random.randint(20, 40)
                player.max_hp += boost
                player.hp += boost
                return f"+{boost} Max HP!"
            elif loot_type == "damage":
                boost = random.randint(3, 7)
                player.damage += boost
                return f"+{boost} Damage!"
            else:
                boost = random.randint(30, 60)
                player.gain_xp(boost)
                return f"+{boost} XP!"
        return None


class Portal(pygame.sprite.Sprite):
    """Portal to next level"""

    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((TILE_SIZE * 2, TILE_SIZE * 2))
        self.image.fill(CYAN)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y


class Dungeon:
    """Procedural dungeon generator"""

    def __init__(self, floor_level):
        self.floor_level = floor_level
        self.walls = pygame.sprite.Group()
        self.enemies = pygame.sprite.Group()
        self.chests = pygame.sprite.Group()
        self.portals = pygame.sprite.Group()

        self.generate()

    def generate(self):
        """Generate dungeon layout"""
        # Create border walls
        for x in range(0, SCREEN_WIDTH, TILE_SIZE):
            self.walls.add(Wall(x, 0))
            self.walls.add(Wall(x, SCREEN_HEIGHT - TILE_SIZE))
        for y in range(0, SCREEN_HEIGHT, TILE_SIZE):
            self.walls.add(Wall(0, y))
            self.walls.add(Wall(SCREEN_WIDTH - TILE_SIZE, y))

        # Create random interior walls
        num_walls = 15 + self.floor_level * 5
        for _ in range(num_walls):
            x = random.randrange(TILE_SIZE * 3, SCREEN_WIDTH - TILE_SIZE * 4, TILE_SIZE)
            y = random.randrange(TILE_SIZE * 3, SCREEN_HEIGHT - TILE_SIZE * 4, TILE_SIZE)

            # Create wall segments
            length = random.randint(3, 6)
            horizontal = random.choice([True, False])

            for i in range(length):
                if horizontal:
                    wall_x = x + i * TILE_SIZE
                    wall_y = y
                else:
                    wall_x = x
                    wall_y = y + i * TILE_SIZE

                if (TILE_SIZE * 2 < wall_x < SCREEN_WIDTH - TILE_SIZE * 3 and
                    TILE_SIZE * 2 < wall_y < SCREEN_HEIGHT - TILE_SIZE * 3):
                    self.walls.add(Wall(wall_x, wall_y))

        # Spawn enemies
        enemy_count = 8 + self.floor_level * 4
        if self.floor_level < 3:
            enemy_count = 12 if self.floor_level == 1 else 16
        else:
            enemy_count = 10

        for _ in range(enemy_count):
            x, y = self.get_random_position()
            self.enemies.add(Enemy(x, y, self.floor_level))

        # Spawn boss on floor 3
        if self.floor_level == 3:
            x, y = self.get_random_position()
            self.enemies.add(Enemy(x, y, self.floor_level, is_boss=True))

        # Spawn chests
        chest_count = 2 + self.floor_level
        for _ in range(chest_count):
            x, y = self.get_random_position()
            self.chests.add(Chest(x, y))

        # Spawn portal (not on final floor until boss defeated)
        if self.floor_level < 3:
            x, y = self.get_random_position()
            self.portals.add(Portal(x, y))

    def get_random_position(self):
        """Get random position not in walls"""
        while True:
            x = random.randrange(TILE_SIZE * 3, SCREEN_WIDTH - TILE_SIZE * 4, TILE_SIZE)
            y = random.randrange(TILE_SIZE * 3, SCREEN_HEIGHT - TILE_SIZE * 4, TILE_SIZE)

            # Check not in wall
            test_rect = pygame.Rect(x, y, TILE_SIZE, TILE_SIZE)
            collides = False
            for wall in self.walls:
                if test_rect.colliderect(wall.rect):
                    collides = True
                    break

            if not collides:
                return x, y

    def spawn_victory_portal(self):
        """Spawn portal after boss defeated"""
        x, y = self.get_random_position()
        self.portals.add(Portal(x, y))


class Game:
    """Main game class"""

    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("TVBuddy - Action RPG")
        self.clock = pygame.time.Clock()
        self.running = True

        self.state = GameState.MENU
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)

        self.player = None
        self.dungeon = None
        self.floor = 1
        self.projectiles = pygame.sprite.Group()
        self.message = ""
        self.message_time = 0

    def run(self):
        """Main game loop"""
        while self.running:
            self.handle_events()
            self.update()
            self.render()
            self.clock.tick(FPS)

        pygame.quit()

    def handle_events(self):
        """Handle input events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            if self.state == GameState.MENU:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_1:
                        self.start_game("Warrior")
                    elif event.key == pygame.K_2:
                        self.start_game("Ranger")
                    elif event.key == pygame.K_3:
                        self.start_game("Wizard")

            elif self.state == GameState.PLAYING:
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:  # Left click
                        projectile = self.player.attack(event.pos)
                        if projectile:
                            self.projectiles.add(projectile)

            elif self.state in [GameState.GAME_OVER, GameState.VICTORY]:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        self.state = GameState.MENU
                        self.floor = 1

    def start_game(self, char_class):
        """Start new game with selected class"""
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2, char_class)
        self.floor = 1
        self.dungeon = Dungeon(self.floor)
        self.projectiles.empty()
        self.state = GameState.PLAYING
        self.show_message(f"{char_class} selected! Clear the dungeon!")

    def update(self):
        """Update game state"""
        if self.state != GameState.PLAYING:
            return

        keys = pygame.key.get_pressed()

        # Update player
        self.player.update(keys, self.dungeon.walls)

        # Update enemies
        for enemy in self.dungeon.enemies:
            enemy.update(self.player, self.dungeon.walls)

            # Enemy attack
            projectile = enemy.attack_player(self.player)
            if projectile:
                self.projectiles.add(projectile)

        # Update projectiles
        self.projectiles.update()

        # Projectile collisions
        for projectile in self.projectiles:
            if projectile.owner == "player":
                # Check enemy hits
                hit_enemies = pygame.sprite.spritecollide(
                    projectile, self.dungeon.enemies, False)
                for enemy in hit_enemies:
                    if enemy.take_damage(projectile.damage):
                        enemy.kill()
                        self.player.gain_xp(enemy.xp_value)
                        self.show_message(f"+{enemy.xp_value} XP!")
                    projectile.kill()
                    break
            else:  # enemy projectile
                if projectile.rect.colliderect(self.player.rect):
                    if self.player.take_damage(projectile.damage):
                        self.state = GameState.GAME_OVER
                    projectile.kill()

        # Check chest interactions
        chest_collisions = pygame.sprite.spritecollide(
            self.player, self.dungeon.chests, False)
        for chest in chest_collisions:
            message = chest.open(self.player)
            if message:
                self.show_message(message)

        # Check portal
        portal_collisions = pygame.sprite.spritecollide(
            self.player, self.dungeon.portals, False)
        if portal_collisions:
            self.next_floor()

        # Check if all enemies defeated on floor 3
        if self.floor == 3 and len(self.dungeon.enemies) == 0:
            if len(self.dungeon.portals) == 0:
                self.dungeon.spawn_victory_portal()
                self.show_message("Boss defeated! Portal appeared!")

    def next_floor(self):
        """Progress to next floor"""
        if self.floor < 3:
            self.floor += 1
            self.dungeon = Dungeon(self.floor)
            self.player.rect.center = (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
            self.projectiles.empty()
            self.show_message(f"Floor {self.floor}")
        else:
            self.state = GameState.VICTORY

    def show_message(self, text):
        """Show temporary message"""
        self.message = text
        self.message_time = pygame.time.get_ticks()

    def render(self):
        """Render everything"""
        self.screen.fill(BLACK)

        if self.state == GameState.MENU:
            self.render_menu()
        elif self.state == GameState.PLAYING:
            self.render_game()
        elif self.state == GameState.GAME_OVER:
            self.render_game_over()
        elif self.state == GameState.VICTORY:
            self.render_victory()

        pygame.display.flip()

    def render_menu(self):
        """Render character selection menu"""
        title = self.font.render("TVBuddy - Action RPG", True, WHITE)
        self.screen.blit(title, (SCREEN_WIDTH // 2 - title.get_width() // 2, 100))

        subtitle = self.small_font.render("Select Your Character", True, WHITE)
        self.screen.blit(subtitle, (SCREEN_WIDTH // 2 - subtitle.get_width() // 2, 160))

        y_pos = 250

        # Warrior
        pygame.draw.rect(self.screen, RED, (250, y_pos, TILE_SIZE * 2, TILE_SIZE * 2))
        text = self.small_font.render("[1] Warrior", True, WHITE)
        self.screen.blit(text, (320, y_pos + 10))
        stats = self.small_font.render("HP: 150 | DMG: 25 | Melee", True, GRAY)
        self.screen.blit(stats, (320, y_pos + 40))

        y_pos += 100

        # Ranger
        pygame.draw.rect(self.screen, GREEN, (250, y_pos, TILE_SIZE * 2, TILE_SIZE * 2))
        text = self.small_font.render("[2] Ranger", True, WHITE)
        self.screen.blit(text, (320, y_pos + 10))
        stats = self.small_font.render("HP: 100 | DMG: 15 | Ranged", True, GRAY)
        self.screen.blit(stats, (320, y_pos + 40))

        y_pos += 100

        # Wizard
        pygame.draw.rect(self.screen, BLUE, (250, y_pos, TILE_SIZE * 2, TILE_SIZE * 2))
        text = self.small_font.render("[3] Wizard", True, WHITE)
        self.screen.blit(text, (320, y_pos + 10))
        stats = self.small_font.render("HP: 75 | DMG: 12 | Fast Ranged", True, GRAY)
        self.screen.blit(stats, (320, y_pos + 40))

        controls = self.small_font.render(
            "Controls: WASD = Move | Mouse Click = Attack", True, WHITE)
        self.screen.blit(controls,
                        (SCREEN_WIDTH // 2 - controls.get_width() // 2, 600))

    def render_game(self):
        """Render gameplay"""
        # Draw walls
        self.dungeon.walls.draw(self.screen)

        # Draw chests
        self.dungeon.chests.draw(self.screen)

        # Draw portals
        self.dungeon.portals.draw(self.screen)

        # Draw enemies
        self.dungeon.enemies.draw(self.screen)

        # Draw enemy HP bars
        for enemy in self.dungeon.enemies:
            hp_ratio = enemy.hp / enemy.max_hp
            bar_width = 40 if not enemy.is_boss else 80
            pygame.draw.rect(self.screen, RED,
                           (enemy.rect.x, enemy.rect.y - 10, bar_width, 5))
            pygame.draw.rect(self.screen, GREEN,
                           (enemy.rect.x, enemy.rect.y - 10, bar_width * hp_ratio, 5))

        # Draw player
        self.screen.blit(self.player.image, self.player.rect)

        # Draw projectiles
        self.projectiles.draw(self.screen)

        # Draw UI
        self.render_ui()

        # Draw message
        if pygame.time.get_ticks() - self.message_time < 3000:
            text = self.font.render(self.message, True, YELLOW)
            self.screen.blit(text,
                           (SCREEN_WIDTH // 2 - text.get_width() // 2, 50))

    def render_ui(self):
        """Render UI overlay"""
        ui_y = 10

        # Class
        text = self.small_font.render(
            f"Class: {self.player.char_class}", True, WHITE)
        self.screen.blit(text, (10, ui_y))
        ui_y += 30

        # HP Bar
        text = self.small_font.render("Health:", True, WHITE)
        self.screen.blit(text, (10, ui_y))
        hp_ratio = self.player.hp / self.player.max_hp
        pygame.draw.rect(self.screen, RED, (100, ui_y + 5, 200, 20))
        pygame.draw.rect(self.screen, GREEN, (100, ui_y + 5, 200 * hp_ratio, 20))
        text = self.small_font.render(
            f"{int(self.player.hp)}/{self.player.max_hp}", True, WHITE)
        self.screen.blit(text, (310, ui_y))
        ui_y += 35

        # Resource Bar
        text = self.small_font.render(f"{self.player.resource_name}:", True, WHITE)
        self.screen.blit(text, (10, ui_y))
        resource_ratio = self.player.resource / self.player.resource_max
        color = BLUE if self.player.char_class == "Wizard" else YELLOW
        pygame.draw.rect(self.screen, DARK_GRAY, (100, ui_y + 5, 200, 20))
        pygame.draw.rect(self.screen, color, (100, ui_y + 5, 200 * resource_ratio, 20))
        text = self.small_font.render(
            f"{int(self.player.resource)}/{self.player.resource_max}", True, WHITE)
        self.screen.blit(text, (310, ui_y))
        ui_y += 35

        # XP Bar
        text = self.small_font.render(f"Level {self.player.level}:", True, WHITE)
        self.screen.blit(text, (10, ui_y))
        xp_ratio = self.player.xp / self.player.xp_to_next
        pygame.draw.rect(self.screen, DARK_GRAY, (100, ui_y + 5, 200, 20))
        pygame.draw.rect(self.screen, PURPLE, (100, ui_y + 5, 200 * xp_ratio, 20))
        text = self.small_font.render(
            f"{self.player.xp}/{self.player.xp_to_next} XP", True, WHITE)
        self.screen.blit(text, (310, ui_y))
        ui_y += 35

        # Floor
        text = self.small_font.render(f"Floor: {self.floor}/3", True, WHITE)
        self.screen.blit(text, (10, ui_y))
        ui_y += 30

        # Enemy count
        text = self.small_font.render(
            f"Enemies: {len(self.dungeon.enemies)}", True, WHITE)
        self.screen.blit(text, (10, ui_y))

    def render_game_over(self):
        """Render game over screen"""
        text = self.font.render("GAME OVER", True, RED)
        self.screen.blit(text,
                        (SCREEN_WIDTH // 2 - text.get_width() // 2, 250))

        stats = self.small_font.render(
            f"Level {self.player.level} {self.player.char_class} - Floor {self.floor}",
            True, WHITE)
        self.screen.blit(stats,
                        (SCREEN_WIDTH // 2 - stats.get_width() // 2, 350))

        text = self.small_font.render(
            "Press ENTER to return to menu", True, WHITE)
        self.screen.blit(text,
                        (SCREEN_WIDTH // 2 - text.get_width() // 2, 450))

    def render_victory(self):
        """Render victory screen"""
        text = self.font.render("VICTORY!", True, GOLD)
        self.screen.blit(text,
                        (SCREEN_WIDTH // 2 - text.get_width() // 2, 250))

        stats = self.small_font.render(
            f"Level {self.player.level} {self.player.char_class} - Dungeon Cleared!",
            True, WHITE)
        self.screen.blit(stats,
                        (SCREEN_WIDTH // 2 - stats.get_width() // 2, 350))

        text = self.small_font.render(
            "Press ENTER to return to menu", True, WHITE)
        self.screen.blit(text,
                        (SCREEN_WIDTH // 2 - text.get_width() // 2, 450))


if __name__ == "__main__":
    game = Game()
    game.run()
