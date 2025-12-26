# 🎮 TVBuddy - Isometric Action RPG

An isometric dungeon-crawler Action RPG built with Python and Pygame.

## Game Features

⚔️ **3 Character Classes**
- **Warrior** - High HP, High Damage, Slow Attack (Health + Stamina)
- **Ranger/Thief** - Mid HP, Mid Damage, Ranged Attack (Health + Stamina)
- **Wizard/Sorceress** - Low HP, Low Damage, Fast Ranged Attack (Health + Mana)

🏰 **3-Level Procedural Dungeon**
- Level 1-2: Progressive difficulty with scaling enemies
- Level 3: Hardest mobs + Final Boss
- Randomly generated walls, doors, and treasure chests

📈 **Progression System**
- XP-based leveling that boosts Health and Damage
- Stat-boost loot from chests
- Enemy difficulty scaling per floor

🎨 **Game UI**
- Health and Resource bars (Stamina/Mana)
- XP tracker
- Floor number indicator
- Character class selection screen

## Controls

- **WASD** - Character movement
- **Mouse Click** - Attack/Cast spell
- **ESC** - Pause/Menu

## Installation

### Prerequisites

```bash
# Python 3.8 or higher
python --version

# Pygame library
pip install pygame
```

### Running the Game

```bash
# Clone the repository
git clone https://github.com/evlswtmn/tvbuddy.git
cd tvbuddy

# Install dependencies
pip install -r requirements.txt

# Run the game
python main.py
```

## Project Structure

```
tvbuddy/
├── main.py              # Game entry point and main loop
├── game/
│   ├── player.py        # Player class and character classes
│   ├── enemy.py         # Enemy classes and AI
│   ├── dungeon.py       # Procedural dungeon generation
│   ├── projectile.py    # Projectile/attack system
│   ├── items.py         # Loot and chest system
│   ├── ui.py            # UI overlay and menus
│   └── utils.py         # Helper functions
├── assets/              # Sprites and sounds (placeholder colored shapes)
├── requirements.txt     # Python dependencies
└── README.md
```

## Development

For AI assistants and developers working on this codebase, see [CLAUDE.md](CLAUDE.md) for detailed development guidelines and architecture documentation.

## Technical Details

- **Engine**: Pygame
- **Language**: Python 3.8+
- **Architecture**: Modular class-based design
- **Graphics**: Colored placeholder sprites (easily replaceable)
- **Dungeon Generation**: Procedural algorithm with rooms and corridors

## Roadmap

- [x] Character class system
- [x] Procedural dungeon generation
- [x] Combat mechanics
- [x] XP and leveling system
- [ ] Sound effects and music
- [ ] Sprite artwork
- [ ] Additional enemy types
- [ ] Special abilities per class
- [ ] Save/Load system
- [ ] Multiple boss variants

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify!

---

Made with ❤️ for dungeon-crawler fans
