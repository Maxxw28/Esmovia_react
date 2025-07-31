import { Link } from 'react-router-dom';

export default function GameSelection() {
	return (
		<>
			<Link to="/dashboard/crash" className="flex items-center gap-2">
				<button>-- CRASH</button>
			</Link>
			<Link to="/dashboard/roulette" className="flex items-center gap-2">
				<button>-- ROULETTE</button>
			</Link>
		</>
	);
}
