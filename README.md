<h1 align="center">Welcome to The Cozy Corner</h1>

This project was generated using [Angular](https://angular.io) version 20.0.3.

<p>
</p>

> Frontend for a cozy online bookstore built with Angular. It provides a user-friendly interface where you can explore books, search for specific titles, and narrow-down your choices using filters and sorting options. The interface allows you to keep track of your favorites, manage your cart and review your past orders. The aim is to create a friendly and welcoming experience that feels just like your favorite local bookstore - just online.

## Backend

The backend for **The Cozy Corner** is in a separate repository.<br>
You can find it here: [Cozy Corner Backend](https://github.com/steefy02/Bookstore-Backend)
Make sure to set up and run the backend first, then follow the the instructions below to start the user interface.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 20+ recommended)
- [Angular CLI](https://angular.io/cli) (version 20.0.3)

## Instalation

1. Clone the repository:

```sh
git clone https://github.com/steefy02/Bookstore-Frontend.git
```

2. Install dependencies:

```sh
cd Bookstore-Frontend
npm install
```

## Configuration

The frontend communicates with the backend REST API. Make sure the backend server is running (default: `http://localhost:8080`).<br>
You can configure the API base URL in the `src/environments/environment.ts` file if needed:

```sh
export const environment = {
  apiUrl: 'http://localhost:8080'
};
```

## Getting Started

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.<br>
The app will automatically reload every time you change any of the source files.
