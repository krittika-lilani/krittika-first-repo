# Computational Design Workflows

This website brings together seven projects developed throughout the class. Across the assignments, I used food as a recurring subject to experiment with different ways of representing space, time, relationships, data, participation, and interaction.

The homepage at `index.html` acts as an index to the seven digital objects. The gradients are colour coded to each object.

## 1. 2D Spatial Canvas

An interactive food still life built with **p5.js**. The project uses drawing, animation, and mouse interaction to turn a breakfast scene into a responsive 2D canvas.

Files:
- `spatial-canvases.html`
- `spatial-canvases/sketch-static.js`
- `spatial-canvases/spatial-canvases.css`

## 2. 3D Spatial Canvas

A three-dimensional breakfast scene built with **Three.js**. The exercise explores food as geometry through modeled forms, lighting, materials, and spatial interaction.

Files:
- `spatial-canvases.html`
- `spatial-canvases/three-breakfast-forms.js`
- `spatial-canvases/three-breakfast-light.js`
- `spatial-canvases/spatial-canvases.css`

## 3. Temporal Structure

A data visualization exploring how long it takes me to cook çılbır, the same breakfast represented in the 2D spatial canvas. The project translates the cooking process into a temporal structure using **D3.js**, allowing individual actions and durations to become visible as data.

Files:
- `data-visualization.html`
- `data-visualization/data-viz.js`
- `data-visualization/data-visualization.css`
- `data-visualization/events.csv`
- `data-visualization/icons/`

## 4. Relational Structure

A personal **D3.js** network connecting moods and situations to the foods and places they evoke.

Files:
- `relational-structure.html`
- `relational-structure/actor-network.js`
- `relational-structure/relational-structure.css`
- `relational-structure/data/`

## 5. Geospatial Structure

This project began as my final project for Mapping Systems and maps a personal archive of restaurants, cafés, bars, bookstores, shops, and other places I have saved across New York over years.

Google Maps data was cleaned and spatialized using **Python, pandas, GeoPandas, and geocoding tools**, exported as **GeoJSON**, and turned into an interactive map using **MapLibre GL JS**. Users can explore and filter the collection by category and location.

Files:
- `geospatial-structures.html`
- `geospatial-structures/`

## 6. Engagement Component

A real-time leftover cooking game built using **Firebase Realtime Database**.

Users are presented with a small set of leftover fridge ingredients and choose a minimum of two. They then invent a dish using their selection and can optionally leave a short note. Each submission is stored in Firebase and immediately appears for everyone viewing the page.

As more people participate, the game becomes a growing collection of different interpretations of the same ingredients, including the approximate location and time of each submission. A cultural amalgamation.

Files:
- `recipe-game/index.html`
- `recipe-game/style.css`
- `recipe-game/script.js`
- `recipe-game/assets/`

## 7. Agent

A food-focused conversational agent built using the **OpenAI API** and connected to **Firebase**.

The agent behaves as a slightly opinionated experimental chef. Users can tell it what ingredients they have, what they are craving, or ask for help developing a dish. Conversation memory allows the agent to respond to previous messages rather than treating every question independently.

Files:
- `chatbot/index.html`
- `chatbot/style.css`
- `chatbot/chat-bot.js`

## Technologies

- HTML
- CSS
- JavaScript
- p5.js
- Three.js
- D3.js
- Python
- pandas
- GeoPandas
- GeoJSON
- MapLibre GL JS
- Firebase Realtime Database
- OpenAI API
