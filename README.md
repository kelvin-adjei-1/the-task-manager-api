# The Task Manager API

This is a RESTful API for managing tasks, boards, lists, comments, attachments, notifications, and workspaces. Built with Node.js and Express.

## Features
- User authentication
- Boards, lists, and tasks management
- Comments and attachments
- Notifications
- Workspace support

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the API
```sh
npm start
```

## Folder Structure
- `index.js` - Entry point
- `db.js`, `db-helpers.js` - Database helpers
- `routes/` - API route handlers
- `middleware/` - Authentication middleware

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
