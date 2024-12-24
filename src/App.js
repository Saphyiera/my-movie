import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Preview from './components/Preview/Preview';
import Actors from './components/Search/Actor/Actors';
import Genres from './components/Search/Genre/Genres';
import SearchResult from './components/Search/SearchResult';
import SearchLayout from './components/Layout';
import WatchPage from './components/WatchPage/WatchPage';
import HomePage from './components/HomePage/HomePage';
import SignupPage from './components/AccountPage/SignupPage/SignupPage';
import LoginPage from './components/AccountPage/LoginPage/LoginPage';
import Footer from './components/Footer/Footer';
import ProfilePage from './components/AccountPage/ProfilePage/ProfilePage';
import Season from './components/Preview/SeasonSection/Season/Season';
import MarkedMovies from './components/MarkedMoviesPage/MarkedMovies/MarkedMovies';
import PlaylistPage from './components/PlaylistPage/PlaylistPage';
import Billing from './components/BillingsPage/Billings';
import Success from './components/BillingsPage/Success';
import Fail from './components/BillingsPage/Fail';
import AboutUs from './components/Footer/Links/AboutUs';
import ContactUs from './components/Footer/Links/ContactUs';
import TermsAndConditions from './components/Footer/Links/TermsAndConditions';
import PrivacyPolicy from './components/Footer/Links/PrivacyPolicy';
import FAQ from './components/Footer/Links/FAQ'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SearchLayout />}>
          <Route index element={<HomePage />} />
          <Route path='user'>
            <Route path='signup' element={<SignupPage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='profile' element={<ProfilePage />} />
          </Route>
          <Route path='genres' element={<Genres />} />
          <Route path='actors' element={<Actors />} />
          <Route path='result' element={<SearchResult />} />
          <Route path='preview/:id' element={<Preview />} />
          <Route path='season/:id' element={<Season />} />
          <Route path='watch/:id' element={<WatchPage />} />
          <Route path='marked' element={<MarkedMovies />} />
          <Route path='playlists' element={<PlaylistPage />} />
          <Route path='billings'>
            <Route path='' element={<Billing />} />
            <Route path='success' element={<Success />} />
            <Route path='fail' element={<Fail />} />
          </Route>
          <Route path='footer'>
            <Route path='about' element={<AboutUs />} />
            <Route path='contact' element={<ContactUs />} />
            <Route path='terms' element={<TermsAndConditions />} />
            <Route path='policy' element={<PrivacyPolicy />} />
            <Route path='faq' element={<FAQ />} />
          </Route>
        </Route >
      </Routes >
      <Footer />
    </BrowserRouter >
  );
}

export default App;
