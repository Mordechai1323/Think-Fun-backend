# Think-fun Backend

This repository contains the backend code for the Think-fun project, an online gaming platform that offers a variety of games and features for users to enjoy.

## Technologies Used

-   Node.js: Backend implementation language
-   Express.js: Web application framework
-   MongoDB: Database management system
-   Bcrypt: Password encryption library
-   Jsonwebtoken: Token signing and validation library
-   Multer: File upload middleware
-   Socket.io: Real-time communication library for chats and online games
-   @sendgrid/mail: Email communication service
-   Jest: Testing framework

## Features

-   Game options: Matching game, Tic Tac Toe, and Checkers
-   User authentication and management system
    -   Create an account
    -   Upload/update/delete a profile picture
    -   Change password
    -   Reset password for forgotten passwords via email verification code
    -   Update user details
    -   Delete the account
-   Multiplayer functionality: Play against the computer, a random player, or invite a friend
-   In-game chat feature
-   Statistics tracking for wins, losses, and ties
-   Leaderboard showcasing the top 5 players
-   Administration panel for managing user roles, game categories, and database games

## Security Measures

-   Communication encryption using TLS/SSL
-   Storage of tokens in httpOnly cookies to prevent theft by JavaScript
-   Token refresh and access mechanisms for enhanced safety
-   Implementation of reCAPTCHA to prevent brute force attacks
-   Password encryption to safeguard against unauthorized access
-   Input validation to prevent XSS script injections
