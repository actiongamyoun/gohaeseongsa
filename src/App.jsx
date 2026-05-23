import { useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="app-frame">
      <HomeScreen
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
}
