// import Ball from "./Ball";
// import Platform from "./Platform";

// interface Props {
//     ctx: CanvasRenderingContext2D,
//     platform: Platform,
//     radius: number,
//     color: string,
//     speed: number,
// }

// export default class BallManager {
//     private balls: Ball[] = [];
//     private lostBalls = 0;

//     constructor() {
//     }

//     createBall({ ctx, platform, radius, color, speed }: Props) {
//         this.balls.push(new Ball({
//             ctx, 
//             platform,
//             radius, 
//             color,
//             speed
//         }));
//     }

//     draw() {
//         this.balls.forEach((ball) => ball.draw());
//     }

//     update(canvasWidth: number, canvasHeight: number, platform: Platform, onGameOver: () => void) {
//         this.balls.forEach((ball) => ball.update(canvasWidth, canvasHeight, platform, () => {
//             this.lostBalls++;
//             console.log('this.lostBalls', this.lostBalls);
//             if (this.lostBalls === this.balls.length) {
//                 onGameOver(); 
//             }
//         }));
//     }

//     pause() {
//         this.balls.forEach((ball) => ball.pause());
//     }

//     positionOnPlatform(platform: Platform) {
//         this.balls.forEach((ball) => ball.positionOnPlatform(platform));
//     }
    
//     getBalls() {
//         return this.balls;
//     }
// }
