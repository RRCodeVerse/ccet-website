import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import CCETLogo from "../../assets/header/ccetLogo.png";
import IndianEmblem from "../../assets/header/Indian-Emblem.png";

const Header = () => {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [activeNav, setActiveNav] = useState("Home");
	const [expandedMenu, setExpandedMenu] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isScrolled, setIsScrolled] = useState(false);
	const mobileNavRef = useRef(null);

	useEffect(() => {
		fetchNavigationData();
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const fetchNavigationData = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('https://ccet.ac.in/api/header.php?endpoint=full-navigation');
			const result = await response.json();

			if (result.navigation && result.navigation.length > 0) {
				const formattedMenuItems = formatNavigationData(result.navigation);
				setMenuItems(formattedMenuItems);
			} else {
				setError("No navigation data available");
				setMenuItems([]);
			}
		} catch (err) {
			setError("Error loading navigation");
			console.error("Navigation fetch error:", err);
			setMenuItems([]);
		} finally {
			setLoading(false);
		}
	};

	const formatNavigationData = (navigationData) => {
		return navigationData.map(navItem => {
			if (!navItem.submenus || navItem.submenus.length === 0) {
				return {
					label: navItem.nav_name,
					path: navItem.nav_path || "/",
					external: navItem.nav_path?.startsWith('http')
				};
			}

			const sections = navItem.submenus.map(submenu => ({
				title: submenu.submenu_name,
				links: submenu.tabs.map(tab => ({
					name: tab.tab_name,
					path: tab.tab_path,
					url: tab.tab_path,
					external: tab.is_external,
					pdfs: tab.pdfs || []
				}))
			}));

			return {
				label: navItem.nav_name,
				sections: sections,
			};
		});
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				mobileNavRef.current &&
				!mobileNavRef.current.contains(event.target)
			) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuOpen]);

	const toggleSubmenu = (label) => {
		if (expandedMenu === label) {
			setExpandedMenu(null);
		} else {
			setExpandedMenu(label);
		}
	};

	const handleNavigation = (item) => {
		if (item.external || item.url?.startsWith('http') || item.path?.startsWith('http')) {
			window.open(item.path || item.url, "_blank");
		} else {
			navigate(item.path || item.url);
		}
		setMenuOpen(false);
		setExpandedMenu(null);
	};

	const handleMainMenuClick = (menuItem) => {
		if (menuItem.path) {
			if (menuItem.external) {
				window.open(menuItem.path, "_blank");
			} else {
				navigate(menuItem.path);
			}
			setActiveNav(menuItem.label);
			setMenuOpen(false);
		} else if (menuItem.sections) {
			toggleSubmenu(menuItem.label);
		}
	};

	const renderDropdownMenu = (sections, label) => {
		let positionClass = "left-1/2 -translate-x-1/2";
		let gridCols = "grid-cols-3";

		if (label === "About Us") {
			positionClass = "-left-30 -translate-x-[11%]";
			gridCols = "grid-cols-3";
		} else if (label === "Admissions") {
			positionClass = "left-1/2 -translate-x-[30%]";
			gridCols = "grid-cols-4";
		} else if (label === "Academics") {
			positionClass = "left-1/2 -translate-x-[45%]";
			gridCols = "grid-cols-4";
		} else if (label === "Students Section") {
			positionClass = "left-1/2 -translate-x-[60%]";
			gridCols = "grid-cols-3";
		} else if (label === "Notices") {
			positionClass = "left-1/2 -translate-x-[93%]";
			gridCols = "grid-cols-1 md:grid-cols-3";
		}

		return (
			<div
  className={`absolute top-full ${positionClass} transform overflow-x-auto hidden group-hover:block 
  bg-white/70 backdrop-blur-md shadow-xl z-50 p-6 text-lg text-gray-800 
  rounded-lg border border-gray-100 min-w-[1000px] max-w-[90vw]`}
>
  <div className={`grid ${gridCols} gap-8`}>
    {sections.map((section, i) => (
      <div key={i}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left font-semibold border-b border-gray-200 pb-2 mb-3 text-red-700">
                {section.title}
              </th>
            </tr>
          </thead>

          <tbody>
            {section.links.map((link, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#FB923C] hover:text-white transition-colors duration-200"
              >
                <td className="px-2 py-2">
                  {(link.external ||
                    link.url?.startsWith("http") ||
                    link.path?.startsWith("http")) ? (
                    <a
                      href={link.path || link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.path || link.url} className="block w-full">
                      {link.name}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </div>
</div>

		);
	};

	if (loading) {
		return (
			<div className="w-full bg-white md:bg-gradient-to-r md:from-blue-900 md:to-slate-900 sticky top-0 z-50">
				<div className="flex justify-center items-center py-8">
					<span className="text-white">Loading navigation...</span>
				</div>
			</div>
		);
	}

	if (error && menuItems.length === 0) {
		return (
			<div className="w-full bg-white md:bg-gradient-to-r md:from-blue-900 md:to-slate-900 sticky top-0 z-50">
				<div className="flex justify-center items-center py-8">
					<span className="text-white">{error}</span>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Placeholder to prevent content from jumping behind fixed header */}
			<div className={`w-full transition-all duration-300 ${isScrolled ? 'h-[50px] lg:h-[60px]' : 'h-[130px] lg:h-[200px]'}`} />

			<div className="w-full bg-white md:bg-gradient-to-r md:from-blue-900 md:to-slate-900 fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300">
				{/* Mobile View */}
				<div className="lg:hidden w-full bg-gradient-to-r from-blue-900 to-slate-900 shadow">
					<div className={`w-full px-2 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>
						<img
							src={CCETLogo}
							alt="CCET Logo"
							className={`w-auto transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`}
						/>

						<div className="flex-1 text-center px-2">
							<h1 className={`text-white font-serif leading-snug transition-all duration-300 ${isScrolled ? 'text-[14px]' : 'text-[16px]'}`}>
								Chandigarh College of Engineering and Technology
							</h1>

							<p className={`text-gray-300 font-serif leading-none mt-1 transition-all duration-300 ${isScrolled ? 'text-[12px]' : 'text-[14px]'}`}>
								(PU | Chandigarh)
							</p>
						</div>
						<img
							src={IndianEmblem}
							alt="Indian Emblem"
							className={`w-auto transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`}
						/>
					</div>

					<div className={`w-full flex justify-end pr-4 transition-all duration-300 ${isScrolled ? 'pb-2' : 'pb-3'}`}>
						<button
							onClick={() => setMenuOpen(true)}
							className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-red-700 px-2.5 py-1 rounded-full shadow text-xs font-medium"
						>
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
							Menu
						</button>
					</div>
				</div>

				{/* Desktop View */}
				<div className={`hidden lg:flex flex-col items-center px-2 w-full max-w-[1436px] mx-auto transition-all duration-300 ${isScrolled ? 'py-1' : 'py-3'}`}>
					{!isScrolled && (
						<div className="flex w-full items-center justify-center gap-2 transition-all duration-300">
							<div className="flex items-center h-full mx-14 min-w-[96px]">
								<img
									className="h-36 w-auto object-contain"
									src={CCETLogo}
									alt="College Logo"
								/>
							</div>
							<div className="flex flex-col flex-shrink items-center px-2 w-full max-w-[900px]">
								<h1 className="font-serif text-white text-4xl text-center leading-tight">
									Chandigarh College of Engineering and Technology
								</h1>
								<h2 className="font-serif text-white text-lg text-center leading-snug mt-1 mb-2 px-2">
									(Government Institute Under Chandigarh UT
									Administration, Affiliated to Panjab University,
									Chandigarh)
								</h2>
								<div className="w-full px-4">
									<div className="max-w-4xl mx-auto border-t-2 border-white mt-2 mb-2" />
								</div>
							</div>
							<div className="flex items-center h-full mx-14 min-w-[96px]">
								<img
									className="h-34 w-auto object-contain"
									src={IndianEmblem}
									alt="Indian Emblem"
								/>
							</div>
						</div>
					)}

					<nav className={`w-full flex justify-center items-center gap-3 relative z-50 transition-all duration-300 ${isScrolled ? 'my-0' : '-mt-0 -mb-2'}`}>
						{menuItems.map((menuItem) => (
							<div
								key={menuItem.label}
								className="relative group"
								onMouseEnter={() => setActiveNav(menuItem.label)}
								onMouseLeave={() =>
									setTimeout(() => setActiveNav(""), undefined)
								}
							>
								<div
									className={`cursor-pointer rounded-md font-serif whitespace-nowrap transition-all duration-200 ${isScrolled ? 'px-2 py-1 text-base' : 'px-3 py-1 text-xl'}
                  ${
										activeNav === menuItem.label
											? "bg-yellow-400 text-red-700 shadow-md"
											: "text-white hover:bg-yellow-400 hover:text-red-700 hover:shadow-md"
									}`}
									onClick={() => {
										if (menuItem.path) {
											if (menuItem.external) {
												window.open(menuItem.path, "_blank");
											} else {
												navigate(menuItem.path);
											}
										}
									}}
								>
									{menuItem.label}
								</div>
								{menuItem.sections && activeNav === menuItem.label &&
									renderDropdownMenu(menuItem.sections, menuItem.label)
								}
							</div>
						))}
					</nav>
				</div>

				{/* Mobile Menu */}
				{menuOpen && (
					<div className="fixed top-0 left-0 w-full h-full z-[60] bg-black bg-opacity-50">
						<div
							ref={mobileNavRef}
							className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[70] overflow-y-auto"
						>
							<div className="p-4 border-b font-semibold text-lg bg-blue-900 text-white flex justify-between items-center">
								<span>Navigation</span>
								<button
									onClick={() => setMenuOpen(false)}
									className="text-white hover:text-yellow-300"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{menuItems.map((menuItem) => (
								<div
									key={menuItem.label}
									className="border-b border-gray-200"
								>
									<div
										className={`px-4 py-3 cursor-pointer transition-all duration-200 font-medium flex justify-between items-center
                    ${
											activeNav === menuItem.label
												? "bg-yellow-400 text-red-700"
												: "text-gray-800 hover:bg-gray-100"
										}`}
										onClick={() =>
											handleMainMenuClick(menuItem)
										}
									>
										<span>{menuItem.label}</span>
										{menuItem.sections && (
											<svg
												className={`w-5 h-5 transition-transform duration-200 ${
													expandedMenu === menuItem.label
														? "transform rotate-180"
														: ""
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										)}
									</div>

									{menuItem.sections &&
										expandedMenu === menuItem.label && (
											<div className="bg-gray-50 pl-6 pr-4 py-2">
												{menuItem.sections.map(
													(section, i) => (
														<div
															key={i}
															className="mb-3"
														>
															<div className="font-semibold border-b border-gray-300 pb-1 mb-2 text-red-700 text-sm">
																{section.title}
															</div>
															<ul className="space-y-1">
																{section.links.map(
																	(link, j) => (
																		<li
																			key={j}
																			className="hover:bg-[#FB923C] hover:text-white cursor-pointer transition-colors duration-200 px-2 py-1 rounded text-sm"
																			onClick={() =>
																				handleNavigation(
																					link
																				)
																			}
																		>
																			{
																				link.name
																			}
																		</li>
																	)
																)}
															</ul>
														</div>
													)
												)}
											</div>
										)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Header;
