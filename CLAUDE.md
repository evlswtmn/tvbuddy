# CLAUDE.md - AI Assistant Guide for TVBuddy Game

## Project Overview

**TVBuddy** is an isometric Action RPG dungeon-crawler built with Python and Pygame.

### Project Status
- **Stage**: Active Development
- **Type**: Desktop Game (Python/Pygame)
- **Genre**: Isometric Action RPG
- **Platform**: Cross-platform (Windows, macOS, Linux)

---

## Repository Structure

```
tvbuddy/
├── main.py                 # Game entry point and main game loop
├── game/
│   ├── __init__.py        # Package initializer
│   ├── player.py          # Player class and character types
│   ├── enemy.py           # Enemy classes and AI behavior
│   ├── dungeon.py         # Procedural dungeon generation
│   ├── projectile.py      # Projectile and attack systems
│   ├── items.py           # Loot, chests, and items
│   ├── ui.py              # UI rendering and menus
│   ├── game_state.py      # State management (Menu, Playing, GameOver)
│   └── utils.py           # Helper functions and constants
├── assets/                 # Game assets (sprites, sounds, fonts)
│   ├── sprites/           # Character and enemy sprites
│   ├── sounds/            # Sound effects and music
│   └── fonts/             # UI fonts
├── tests/                  # Unit tests
├── requirements.txt        # Python dependencies
├── .gitignore             # Git ignore rules
├── README.md              # User-facing documentation
└── CLAUDE.md              # This file
```

---

## Game Architecture

### Core Systems

1. **Character System** (`player.py`)
   - Base Player class with common attributes (HP, damage, position)
   - Three character classes: Warrior, Ranger, Wizard
   - Resource management (Stamina/Mana)
   - Movement and attack logic

2. **Enemy System** (`enemy.py`)
   - Base Enemy class
   - Different enemy types per dungeon floor
   - Scaling difficulty system
   - AI behavior (chase, attack, patrol)
   - Boss enemy with special mechanics

3. **Dungeon Generation** (`dungeon.py`)
   - Procedural generation algorithm
   - Room and corridor creation
   - Wall and door placement
   - Chest spawning
   - Stair/portal to next level

4. **Combat System** (`projectile.py`)
   - Melee and ranged attacks
   - Projectile physics
   - Collision detection
   - Damage calculation

5. **Progression System** (`items.py`, `player.py`)
   - XP and leveling
   - Stat increases on level up
   - Loot drops from chests
   - Stat-boost items

6. **UI System** (`ui.py`)
   - Character selection screen
   - In-game overlay (Health, Resources, XP, Floor)
   - Pause menu
   - Game over screen

7. **State Management** (`game_state.py`)
   - Menu state
   - Playing state
   - Paused state
   - Game over/Victory state
   - Level transition state

---

## Development Conventions

### Code Style

1. **Python Style (PEP 8)**
   - Use 4 spaces for indentation
   - Maximum line length: 100 characters
   - Use snake_case for functions and variables
   - Use PascalCase for class names
   - Add docstrings to all classes and public methods

2. **File Organization**
   - One class per file (with exceptions for small related classes)
   - Group related functionality into modules
   - Keep main.py minimal - just game loop and initialization

3. **Naming Conventions**
   - Classes: `Player`, `Enemy`, `Dungeon`
   - Functions: `update_position()`, `handle_collision()`
   - Constants: `SCREEN_WIDTH`, `MAX_HP`
   - Private methods: `_internal_method()`

### Pygame Best Practices

1. **Game Loop Structure**
   ```python
   while running:
       # 1. Handle events
       for event in pygame.event.get():
           # Process input

       # 2. Update game state
       player.update()
       enemies.update()

       # 3. Render
       screen.fill(BLACK)
       draw_all()
       pygame.display.flip()

       # 4. Frame rate
       clock.tick(60)
   ```

2. **Performance**
   - Use sprite groups for efficient rendering
   - Implement dirty rect updating when possible
   - Cache frequently used surfaces
   - Avoid creating new objects in the game loop

3. **Asset Management**
   - Load all assets at initialization, not during gameplay
   - Use placeholder colored shapes for prototyping
   - Keep asset files organized by type

4. **Collision Detection**
   - Use pygame.Rect for simple collisions
   - Implement spatial partitioning for many entities
   - Use sprite groups with collision methods

---

## Game Design Specifications

### Character Classes

**Warrior**
- Health: 150
- Damage: 25
- Attack Speed: Slow (1.5 seconds)
- Resource: Stamina (100)
- Attack Type: Melee

**Ranger/Thief**
- Health: 100
- Damage: 15
- Attack Speed: Medium (1.0 second)
- Resource: Stamina (100)
- Attack Type: Ranged

**Wizard/Sorceress**
- Health: 75
- Damage: 12
- Attack Speed: Fast (0.5 seconds)
- Resource: Mana (100, regenerates 2/second)
- Attack Type: Ranged (fast projectiles)

### Dungeon Levels

**Level 1** - The Entrance
- Enemy Count: 8-12
- Enemy HP: 30-50
- Enemy Damage: 5-10
- Chests: 2-3

**Level 2** - The Depths
- Enemy Count: 12-16
- Enemy HP: 60-80
- Enemy Damage: 10-15
- Chests: 3-4

**Level 3** - The Boss Chamber
- Enemy Count: 6-10 (harder types)
- Enemy HP: 80-100
- Enemy Damage: 15-20
- Boss HP: 500
- Boss Damage: 30
- Chests: 4-5

### Progression

**Leveling**
- XP required: 100 * level
- HP increase per level: +15
- Damage increase per level: +3

**Loot System**
- Chests contain stat-boost items
- Item types: +HP, +Damage, +Attack Speed
- Rare chance for powerful items

---

## Git Workflow

### Branch Strategy

- **main**: Stable, playable builds only
- **develop**: Integration branch for features
- **claude/***: AI assistant working branches
- **feature/***: New game features
- **fix/***: Bug fixes

### Commit Messages

Follow conventional commits:

```
feat(combat): add critical hit mechanic
fix(dungeon): resolve wall collision bug
refactor(player): improve movement code
docs(readme): update installation instructions
```

---

## Testing Strategy

### Manual Testing

1. **Character Classes**
   - Test each class individually
   - Verify resource consumption
   - Check attack mechanics

2. **Dungeon Generation**
   - Generate multiple dungeons
   - Verify no impossible layouts
   - Check for proper spawning

3. **Combat**
   - Test player vs enemy combat
   - Verify damage calculation
   - Check projectile collisions

4. **Progression**
   - Test leveling up
   - Verify stat increases
   - Check loot pickup

### Automated Testing (Future)

- Unit tests for game logic
- Integration tests for systems
- Procedural generation tests

---

## AI Assistant Guidelines

### When Working on This Project

1. **Always Read Before Writing**
   - Understand existing class structure
   - Check dependencies between modules
   - Don't duplicate functionality

2. **Modular Design**
   - Keep classes focused and single-purpose
   - Use composition over inheritance
   - Minimize coupling between systems

3. **Pygame Patterns**
   - Use sprite groups for entity management
   - Implement proper event handling
   - Follow game loop best practices

4. **Placeholder Graphics**
   - Use colored rectangles/circles for prototyping
   - Document sprite dimensions
   - Make sprites easy to replace later

5. **Code Organization**
   - Keep game logic separate from rendering
   - Use constants for magic numbers
   - Comment complex algorithms (especially dungeon generation)

### Common Tasks

#### Adding a New Enemy Type

1. Create class inheriting from Enemy in `enemy.py`
2. Define stats (HP, damage, speed)
3. Implement behavior in `update()` method
4. Add sprite/placeholder graphic
5. Update dungeon spawning logic

#### Adding a New Ability/Attack

1. Create projectile type in `projectile.py`
2. Add ability to character class
3. Implement resource cost
4. Add visual effect
5. Test collision and damage

#### Modifying Dungeon Generation

1. Review existing algorithm in `dungeon.py`
2. Make incremental changes
3. Test multiple generations
4. Ensure no impossible layouts
5. Verify entity spawning

---

## Technical Considerations

### Performance

- Target 60 FPS
- Optimize collision detection for 20+ entities
- Use dirty rect rendering when needed
- Profile code for bottlenecks

### Cross-Platform

- Use relative paths for assets
- Avoid platform-specific code
- Test on Windows, macOS, Linux if possible

### Scalability

- Design for easy addition of new classes
- Make enemy types data-driven
- Support additional dungeon levels
- Prepare for save/load system

---

## Dependencies

### Required

```
pygame >= 2.5.0
```

### Optional (Development)

```
pytest >= 7.0.0           # Unit testing
pygame-gui >= 0.6.0       # Advanced UI (future)
```

---

## Debugging Tips

### Common Issues

**Game Won't Start**
- Check pygame installation: `pip install pygame`
- Verify Python version (3.8+)
- Check for syntax errors in main.py

**Collision Not Working**
- Print rect positions
- Visualize hitboxes (draw rects)
- Check collision groups

**Performance Issues**
- Profile with cProfile
- Check entity count
- Review draw calls
- Optimize update loops

**Dungeon Generation Fails**
- Add generation logging
- Visualize generation steps
- Check boundary conditions
- Verify random seed behavior

---

## Resources

### Pygame Documentation

- [Pygame Docs](https://www.pygame.org/docs/)
- [Pygame Sprite Module](https://www.pygame.org/docs/ref/sprite.html)
- [Pygame Rect Module](https://www.pygame.org/docs/ref/rect.html)

### Game Development

- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Procedural Dungeon Generation](https://www.roguebasin.com/index.php/Articles)
- [Isometric Game Design](https://en.wikipedia.org/wiki/Isometric_video_game_graphics)

### Python

- [PEP 8 Style Guide](https://pep8.org/)
- [Python Docs](https://docs.python.org/3/)

---

## Future Enhancements

### Planned Features

- [ ] Sound effects and background music
- [ ] Sprite artwork (replace placeholders)
- [ ] Additional character classes
- [ ] More enemy varieties
- [ ] Special abilities per class
- [ ] Equipment system
- [ ] Save/Load functionality
- [ ] Multiple boss types
- [ ] Difficulty settings
- [ ] Achievements

### Technical Improvements

- [ ] Unit test suite
- [ ] Performance profiling
- [ ] Advanced UI system
- [ ] Particle effects
- [ ] Screen shake and juice
- [ ] Settings menu
- [ ] Controller support

---

## Notes for AI Assistants

- This is an active game development project
- Focus on playability and fun first, polish later
- Use placeholder graphics - easy to replace
- Keep code modular and well-documented
- Test frequently during development
- Balance is important - enemies should be challenging but fair
- Update this file as architecture evolves

---

**Last Updated**: 2025-12-26
**Version**: 1.0.0 (Initial Game Version)
