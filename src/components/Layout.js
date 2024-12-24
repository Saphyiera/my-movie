import { Outlet, NavLink } from "react-router-dom";
import { FaHome, FaFilm, FaUser, FaStar, FaList, FaWallet } from "react-icons/fa";
import { GiFilmProjector } from "react-icons/gi";

const SearchLayout = () => {
    const userId = localStorage.getItem("id");

    return (
        <>
            <nav style={styles.navbar}>
                <ul style={styles.navList}>
                    <li style={styles.navItem}>
                        <NavLink
                            to="/"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaHome style={styles.icon} /> Home
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to="genres"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <GiFilmProjector style={styles.icon} /> Genres
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to="actors"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaFilm style={styles.icon} /> Actors
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to={userId ? "user/profile" : "user/login"}
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaUser style={styles.icon} /> Account
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to="marked"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaStar style={styles.icon} /> Marked Movies
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to="playlists"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaList style={styles.icon} /> Playlists
                        </NavLink>
                    </li>
                    <li style={styles.navItem}>
                        <NavLink
                            to="billings"
                            style={styles.link}
                            activeStyle={styles.activeLink}
                        >
                            <FaWallet style={styles.icon} /> Billings
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div style={styles.content}>
                <Outlet />
            </div>
        </>
    );
};

const styles = {
    navbar: {
        backgroundColor: "#222",
        top: "0",
        zIndex: "1000",
    },
    navList: {
        display: "flex",
        listStyleType: "none",
        margin: "0",
        padding: "0",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    navItem: {
        margin: "0 10px",
        padding: '10px'
    },
    link: {
        color: "#ddd",
        textDecoration: "none",
        fontSize: "16px",
        padding: "10px 20px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "background-color 0.3s, transform 0.2s",
    },
    activeLink: {
        backgroundColor: "#444",
        color: "#ffdd57",
    },
    icon: {
        fontSize: "18px",
    },
    linkHover: {
        transform: "scale(1.05)",
    },
    content: {
    },
};

export default SearchLayout;
