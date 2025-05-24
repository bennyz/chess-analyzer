# Chess Analyzer

Chess Analyzer is a web application for analyzing chess games


## Getting Started

### Prerequisites

- [Deno](https://deno.com/)

### Installation

```
deno install
```

### Scripts

All tasks are available via Deno:

| Command            | Description               |
|--------------------|---------------------------|
| `deno task dev`    | Start development server  |
| `deno task build`  | Build for production      |
| `deno task preview`| Preview production build  |

Run any task with:

```bash
deno task [task]
# Example:
deno task dev
```

## Project Structure

- `src/`
  - `components/`: React components
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point
  - `index.css`, `App.css`: Stylesheets
- `public/`: Static assets
- `deno.json`: Deno tasks and import mappings
- `vite.config.ts`: Vite configuration

## Core Dependencies

- [React](https://react.dev/) via esm.sh
- [chess.js](https://github.com/jhlywa/chess.js) via esm.sh
- [react-chessboard](https://github.com/Clariity/react-chessboard) via esm.sh
- [Vite](https://vitejs.dev/) (run via npm: prefix under Deno)
- [TypeScript](https://www.typescriptlang.org/)

All dependencies are imported using URLs defined in `deno.json`.

## License

This project is licensed under the terms of the [MIT License](LICENSE).


