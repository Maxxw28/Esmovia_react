import { Link } from 'react-router-dom';

export default function NotFoundDashboard() {
	return (
		<div>
			<section className="flex items-center justify-center mt-10 h-max">
				<div className="max-w-screen-xl px-4 pb-8 mx-auto lg:py-16 lg:px-6">
					<div className="max-w-screen-sm mx-auto text-center">
						<h1 className="mb-4 font-extrabold tracking-tight text-blue-600 text-7xl lg:text-9xl dark:text-blue-500">
							404
						</h1>
						<p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
							Something's missing.
						</p>
						<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
							Sorry, bro we don't have such a page on our dashboard, but don't
							worry check out other available pages and win some points🚀🚀🚀.
						</p>
						<Link
							to="/dashboard"
							className="inline-flex text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4"
						>
							Back to Dashboard
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
