import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { TopicsListPage } from './pages/TopicsListPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { DiagramsPage } from './pages/DiagramsPage';
import { DiagramDetailPage } from './pages/DiagramDetailPage';
import { LegoPiecesPage } from './pages/LegoPiecesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Topics */}
            <Route path="/topics" element={<TopicsListPage />} />
            <Route path="/topics/:category" element={<TopicsListPage />} />
            <Route path="/topic/:slug" element={<TopicDetailPage />} />

            {/* Diagrams */}
            <Route path="/diagrams" element={<DiagramsPage />} />
            <Route path="/diagram/:slug" element={<DiagramDetailPage />} />

            {/* Lego Pieces */}
            <Route path="/lego-pieces" element={<LegoPiecesPage />} />

            {/* Collections */}
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collection/:slug" element={<CollectionDetailPage />} />

            {/* Utility pages */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </AppShell>
      </Router>
    </ThemeProvider>
  );
}

export default App;
