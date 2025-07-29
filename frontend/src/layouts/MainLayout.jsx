import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
	return (
		<div>
			<header>
				<h1>My App</h1>
				<nav>
					<ul>
						<li>
							<Link to="/dashboard">Home</Link>
						</li>
						<li>
							<Link to="/profile">Profile/Dashboard</Link>
						</li>
						<li>
							<Link to="/game1">Game 1</Link>
						</li>
					</ul>
				</nav>
			</header>
			<main>
				<Outlet />
			</main>
			<footer>
				<p>© 2025 MyApp</p>
			</footer>
		</div>
	);
};

export default MainLayout;
