# Brick breaker game on canvas

Demo: [https://brick-breaker-phi.vercel.app/](https://brick-breaker-phi.vercel.app/)

The **Brick Breaker Game**! This is a modern, browser-based implementation of the classic arcade game.

## Technical Approach

- **Canvas API**: Used for rendering the game graphics, including the ball, platform, and bricks.
- **Object-Oriented Design**: Key elements of the game (e.g., `Ball`, `Platform`, `Brick`, `BrickManager`) are implemented as classes to encapsulate their behavior and properties.
- **Collision Detection**: The game checks for collisions between the ball and various objects (platform, bricks) using bounding box logic for realistic interaction.
- **Web Workers**: Almost all game logic runs in a web worker to offload computation from the main thread, ensuring smooth performance.
- **User Input**: The app handles key events and sends them from the main thread to the web worker to ensure the player has control over the game.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
 