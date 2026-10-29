import { TooltipProvider } from './components/ui/tooltip';
import { NewProjectWizard } from './pages/NewProjectWizard';
import { ProjectPage } from './pages/ProjectPage';
import { StartPage } from './pages/StartPage'
import { BrowserRouter, Route, Routes } from 'react-router';

function App() {
    return (
        <TooltipProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<StartPage />} />
                    <Route path="/newProject" element={<NewProjectWizard />} />
                    <Route path="/project" element={<ProjectPage />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    )
}

export default App
