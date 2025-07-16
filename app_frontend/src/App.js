import React, { useEffect, useState } from "react";
import "./App.css";

/**
 * Recipe Explorer Frontend - Modern, minimal, responsive.
 * Features:
 * - Browse recipes as cards/grid
 * - Search by name or ingredient
 * - View recipe details in a modal/panel
 * - Light modern minimal UI with responsive layout
 * Colors: primary (#34a853), secondary (#fbbc05), accent (#ea4335)
 */

/**
 * Utility: Fetch recipes from backend (expecting REST endpoint in ENV)
 */
async function fetchRecipes(search = "", ingredient = "") {
  let url = process.env.REACT_APP_RECIPES_API_URL || "/api/recipes";
  let params = [];
  if (search) params.push("search=" + encodeURIComponent(search));
  if (ingredient) params.push("ingredient=" + encodeURIComponent(ingredient));
  if (params.length) url = `${url}?${params.join("&")}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Could not fetch recipes.");
  return resp.json();
}

/**
 * Recipe List Sidebar: Filter and search controls.
 */
// PUBLIC_INTERFACE
function Sidebar({ search, setSearch, ingredient, setIngredient, onSearch }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h2>Search Recipes</h2>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          className="sidebar-input"
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch()}
        />
      </div>
      <div className="sidebar-section">
        <h3>Ingredient</h3>
        <input
          type="text"
          placeholder="e.g. chicken, rice"
          value={ingredient}
          className="sidebar-input"
          onChange={e => setIngredient(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch()}
        />
      </div>
      <button className="accent-btn" onClick={onSearch}>
        🔍 Search
      </button>
    </aside>
  );
}

/**
 * Header Navigation.
 */
// PUBLIC_INTERFACE
function Header() {
  return (
    <header className="main-header">
      <span className="brand">
        <span style={{ color: "#34a853", fontWeight: 700 }}>Recipe</span>
        <span style={{ color: "#ea4335", fontWeight: 700 }}>Explorer</span>
      </span>
    </header>
  );
}

/**
 * Recipe Card for grid listing
 */
// PUBLIC_INTERFACE
function RecipeCard({ recipe, onClick }) {
  return (
    <div className="recipe-card" onClick={() => onClick(recipe)} tabIndex={0} aria-label={`View details for ${recipe.name}`}>
      <div className="recipe-card-imgbox">
        <img src={recipe.image || "/placeholder.jpg"} alt={recipe.name} className="recipe-card-img" />
      </div>
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.name}</h3>
        <p className="recipe-card-info">{recipe.description}</p>
        <span className="recipe-card-tags">
          {recipe.ingredients && Array.isArray(recipe.ingredients)
            ? recipe.ingredients.slice(0, 3).join(", ")
            : ""}
        </span>
      </div>
    </div>
  );
}

/**
 * Recipe Details Modal/Panel
 */
// PUBLIC_INTERFACE
function RecipeDetails({ recipe, onClose }) {
  if (!recipe) return null;
  return (
    <div className="recipe-modal-bg" onClick={onClose}>
      <div className="recipe-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>{recipe.name}</h2>
        {recipe.image && <img src={recipe.image} alt={recipe.name} className="modal-img" />}
        <p className="modal-description">{recipe.description}</p>
        <section>
          <h4>Ingredients</h4>
          <ul>
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Instructions</h4>
          <ol>
            {(recipe.instructions || []).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/**
 * Recipe Grid/List
 */
// PUBLIC_INTERFACE
function RecipeGrid({ recipes, onRecipeClick }) {
  if (!recipes.length)
    return <div className="no-recipes-found">No recipes found. Try a different search!</div>;
  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
      ))}
    </div>
  );
}

/**
 * Main App Component: Integrates all UI parts and handles state/logic
 */
function App() {
  // Filtering/search state
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  // Recipe main state
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // recipe for details modal
  const [error, setError] = useState("");

  // Initial load and refresh (empty query)
  useEffect(() => {
    doFetch();
    // eslint-disable-next-line
  }, []);

  // Fetch with filter/search
  async function doFetch() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRecipes(search, ingredient);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error fetching recipes.");
      setRecipes([]);
    }
    setLoading(false);
  }

  return (
    <div className="main-app">
      <Header />

      <div className="main-content-wrapper">
        <Sidebar
          search={search}
          setSearch={setSearch}
          ingredient={ingredient}
          setIngredient={setIngredient}
          onSearch={doFetch}
        />

        <main className="main-content">
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="loading-indicator">Loading recipes...</div>
          ) : (
            <RecipeGrid recipes={recipes} onRecipeClick={setSelected} />
          )}
        </main>
      </div>
      <footer className="main-footer">
        &copy; {new Date().getFullYear()} Recipe Explorer — Modern, minimal app
      </footer>

      {selected && (
        <RecipeDetails recipe={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default App;
