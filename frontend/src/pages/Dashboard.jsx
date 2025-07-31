import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons for a more intuitive user experience
import {
	FiUser,
	FiMail,
	FiLock,
	FiAward,
	FiUpload,
	FiLogOut,
	FiX,
} from 'react-icons/fi';

export default function Dashboard() {
	// User and navigation hooks
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	// State for avatar management
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState(null);
	const [uploading, setUploading] = useState(false);

	// Effect to set user data or redirect
	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			setUser(userData);
			if (userData.avatar) {
				setAvatarPreview(userData.avatar);
			}
		} else {
			navigate('/login');
		}
	}, [navigate]);

	// Handle user logout
	const handleLogout = async () => {
		try {
			const res = await fetch('http://localhost:5000/api/logout', {
				method: 'POST',
				credentials: 'include',
			});
			if (res.ok) {
				localStorage.removeItem('user');
				navigate('/login');
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	};

	// Handle avatar file selection and preview
	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle discarding the new avatar selection
	const handleDiscardAvatarChange = () => {
		setAvatarFile(null);
		setAvatarPreview(user.avatar || 'https://via.placeholder.com/150'); // Revert to original or placeholder
	};

	// Handle avatar upload to the server
	const handleAvatarUpload = async () => {
		if (!avatarFile || !user) return;

		setUploading(true);

		try {
			const toBase64 = (file) =>
				new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = () => resolve(reader.result);
					reader.onerror = (error) => reject(error);
				});

			const base64Avatar = await toBase64(avatarFile);

			const res = await fetch('http://localhost:5000/api/upload-avatar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					email: user.email,
					avatar: base64Avatar,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Avatar upload failed.');
			}

			const updatedUser = { ...user, avatar: base64Avatar };
			setUser(updatedUser);
			localStorage.setItem('user', JSON.stringify(updatedUser));
			setAvatarFile(null);
		} catch (error) {
			console.error('Error uploading avatar:', error);
			setAvatarPreview(user.avatar || 'https://via.placeholder.com/150');
		} finally {
			setUploading(false);
		}
	};

	// Render a loading state while fetching user data
	if (!user) {
		return (
			<div className="flex items-center justify-center h-screen bg-white dark:bg-black">
				<p className="text-lg text-gray-800 dark:text-gray-200">
					Loading user data...
				</p>
			</div>
		);
	}

	return (
		// MODIFIED: Gradient backgrounds added for both light and dark themes
		// <div className="pb-4 text-black transition-colors duration-300 bg-gray-100 rounded-3xl md:pb-12 min-h-max dark:bg-black dark:text-white"></div>
		<div className="pb-4 text-black shadow-lg min-h-max md:pb-12 dark:text-white bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:via-gray-900 dark:to-purple-900 rounded-3xl bg-opacity-80">
			<div className="container p-4 mx-auto md:p-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-4xl font-bold text-gray-800 dark:text-white">
						<span className="text-blue-500 dark:text-blue-600">Dashboard</span>
					</h1>
					<div className="flex items-center space-x-4">
						<button
							onClick={handleLogout}
							className="flex items-center px-4 py-2 text-white transition-colors duration-300 bg-red-600 rounded-lg hover:bg-red-700"
						>
							<FiLogOut className="mr-2" />
							Logout
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
					{/* Left Column: User Profile */}
					<div className="p-6 shadow-lg lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl">
						<div className="flex flex-col items-center">
							<h2 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
								Welcome,{' '}
								<span className="text-purple-600 dark:text-purple-400">
									{user.username}!
								</span>
							</h2>
							<div className="relative mb-4">
								<img
									src={avatarPreview || 'https://via.placeholder.com/150'}
									alt="Avatar"
									className="object-cover w-40 h-40 border-4 border-purple-500 rounded-full dark:border-purple-400"
								/>
								<label
									htmlFor="avatar-upload"
									className="absolute p-2 transition-colors duration-200 bg-purple-600 rounded-full cursor-pointer bottom-1 right-1 hover:bg-purple-700"
								>
									<FiUpload size={20} className="text-white" />
								</label>
								<input
									id="avatar-upload"
									type="file"
									accept="image/*"
									onChange={handleAvatarChange}
									className="hidden"
								/>
							</div>

							{avatarFile && (
								<div className="flex flex-col w-full gap-2 mb-4 sm:flex-row">
									<button
										onClick={handleAvatarUpload}
										disabled={uploading}
										className="flex-1 px-4 py-2 text-white transition-colors duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
									>
										{uploading ? 'Uploading...' : 'Save Avatar'}
									</button>
									<button
										onClick={handleDiscardAvatarChange}
										disabled={uploading}
										className="flex items-center justify-center px-3 py-2 text-white transition-colors duration-300 bg-red-600 rounded-lg hover:bg-red-700"
									>
										<FiX className="mr-1 sm:mr-2" />
										Discard
									</button>
								</div>
							)}

							<div className="w-full mt-4 space-y-3 text-center">
								<p className="flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">
									<FiUser
										className="mr-3 text-purple-600 dark:text-purple-400"
										size={20}
									/>
									{user.username}
								</p>
								<p className="flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">
									<FiMail
										className="mr-3 text-purple-600 dark:text-purple-400"
										size={20}
									/>
									{user.email}
								</p>
								<p className="flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">
									<FiAward
										className="mr-3 text-purple-600 dark:text-purple-400"
										size={20}
									/>
									Points: {user.points}
								</p>
							</div>
						</div>
					</div>

					{/* Right Column: Settings */}
					<div className="p-6 shadow-lg lg:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl">
						<h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
							Account Settings
						</h2>

						<div>
							<h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
								Change Password
							</h3>
							<div className="space-y-4">
								<div className="relative">
									<FiLock className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
									<input
										type="password"
										placeholder="Current Password"
										className="w-full py-3 pl-10 pr-4 transition-colors duration-300 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div className="relative">
									<FiLock className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
									<input
										type="password"
										placeholder="New Password"
										className="w-full py-3 pl-10 pr-4 transition-colors duration-300 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div className="relative">
									<FiLock className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
									<input
										type="password"
										placeholder="Confirm New Password"
										className="w-full py-3 pl-10 pr-4 transition-colors duration-300 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<button className="w-full px-4 py-3 font-semibold text-white transition-colors duration-300 bg-purple-600 rounded-lg hover:bg-purple-700">
									Update Password
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
