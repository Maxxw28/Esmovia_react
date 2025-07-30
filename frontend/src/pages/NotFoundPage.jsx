import { Link } from 'react-router-dom';

export default function NotFoundPage() {
	return (
		<div>
			<section className="bg-white dark:bg-gray-900 h-[100vh] flex items-center justify-center">
				<div className="max-w-screen-xl px-4 py-2 mx-auto lg:py-4 lg:px-6">
					<div className="max-w-screen-sm mx-auto text-center">
						<h1 className="mb-4 font-extrabold tracking-tight text-blue-600 text-7xl lg:text-9xl dark:text-blue-500">
							404
						</h1>
						<p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
							Something's missing.
						</p>
						<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
							Sorry, bro we don't have such a page on our website, but don't
							worry check out our homepage and log in/create an account 🚀🚀🚀.
						</p>
						<Link
							to="/"
							className="inline-flex text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4"
						>
							Back to Homepage
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
