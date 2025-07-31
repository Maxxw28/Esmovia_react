import React from 'react';
import { Link } from 'react-router-dom';

export default function Game1() {
	return (
	<>
		<Link to="/dashboard/crash" className="flex items-center gap-2">
			<button>-- CRASH</button>
		</Link>
		<Link to="/dashboard/Roulette" className="flex items-center gap-2">
			<button>-- ROULETTE</button>
		</Link>

	</>

	)
}
