import Dashboard from './pages/Dashboard';
import PythonCourse from './pages/PythonCourse';
import JavaCourse from './pages/JavaCourse';
import CCourse from './pages/CCourse';
import Practice from './pages/Practice';
import Games from './pages/Games';
import Achievements from './pages/Achievements';
import Projects from './pages/Projects';
import Challenges from './pages/Challenges';
import InterviewPrep from './pages/InterviewPrep';
import Tournaments from './pages/Tournaments';
import Certifications from './pages/Certifications';
import AIPracticeBuilder from './pages/AIPracticeBuilder';
import JavaScriptCourse from './pages/JavaScriptCourse';
import SQLCourse from './pages/SQLCourse';
import AIPersonalizedPath from './pages/AIPersonalizedPath';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import __Layout from './Layout.jsx';
import Login from './pages/Login';


export const PAGES = {
    "Dashboard": Dashboard,
    "PythonCourse": PythonCourse,
    "JavaCourse": JavaCourse,
    "CCourse": CCourse,
    "Practice": Practice,
    "Games": Games,
    "Achievements": Achievements,
    "Projects": Projects,
    "Challenges": Challenges,
    "InterviewPrep": InterviewPrep,
    "Tournaments": Tournaments,
    "Certifications": Certifications,
    "AIPracticeBuilder": AIPracticeBuilder,
    "JavaScriptCourse": JavaScriptCourse,
    "SQLCourse": SQLCourse,
    "AIPersonalizedPath": AIPersonalizedPath,
    "Onboarding": Onboarding,
    "Pricing": Pricing,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};