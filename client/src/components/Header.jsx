import { useState, useEffect, useContext, useRef, forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Search from './Search';
import { Palette } from '@icons';
import { GlobalState } from '@/GlobalState';
import Loading from '@components/Loading';
import MissingPhoto from '@components/MissingPhoto';
import Photo from '@components/Photo';
import useScrollLock from '@hooks/useScrollLock';
import { Cancel, Edit, Logout, Menu, Moon, ReportAnalytics, Settings, SquareRoundedPlus, Sun } from '@icons';

const UserPhoto = ({ photo }) => {
	return (
		<figure>
			{
				photo?.url ?
					<Photo src={ photo.url } width={ 32 } height={ 32 } />
				:
					<MissingPhoto className='w-8 rounded-full' />
			}
		</figure>
	);
};

const UserDropdown = forwardRef(({ user, setOpen, state }, ref) => {
	const navigate = useNavigate();
	const { unlockScroll } = useScrollLock();
	const { names, lastnames, username, photo, role } = user;
	const { token, userAPI: { user: [ , setUserState ] }, setLogged } = state;

	const logout = async e => {
		try {
			e.preventDefault();
			await axios.get('/user/logout', {
				headers: { Authorization: token }
			});

			unlockScroll();
			setLogged(false);
			setOpen(false);
			navigate("/", { replace: true });
			localStorage.clear();
			setUserState({
				user: null,
				isLogged: false
			});

			return toast.success("¡Sesión cerrada exitosamente!");
		} catch (err) {
			toast.error(err.response.data);
		};
	};

	const USER_OPTIONS = [
		{
			path: 'profile/settings',
			icon: <Settings className='w-8 h-5' strokeWidth='1.7' />,
			title: 'Configuración',
			onEvents: {
				onClick: () => setOpen(false)
			}
		},
		{
			path: 'logout',
			icon: <Logout className='w-8 h-5' strokeWidth='1.7' />,
			title: 'Cerrar sesión',
			onEvents: {
				onClick: logout
			},
			danger: true
		}
	];

	return (
		<section className='absolute top-[90%] right-2 lg:-right-8 p-2 min-w-72 rounded-lg bg-white dark:bg-bunker-925 shadow-lg z-50 overflow-hidden' ref={ ref }>

			<div className='flex flex-col w-full h-full '>
				
				<header className='mx-4 mt-4'>
	
					<div className='flex items-center gap-2'>

						{
							role === 1 ?
								<Link
									to={ `artists/${ username }` }
									aria-label={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
									onClick={ () => setOpen(false) }
								>
									<UserPhoto photo={ photo } />
								</Link>
							:
								<UserPhoto photo={ photo } />
						}
	
						<div className='flex flex-col justify-start h-full text-primary dark:text-bunker-100'>
	
							{
								role === 1 ?
									<Link
										to={ `artists/${ username }` }
										className='text-sm font-bold hover:text-accent-500 transition-colors duration-100'
										onClick={ () => setOpen(false) }
									>
										<h2 className='font-semibold'>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
									</Link>
								:
									<span
										className='text-sm font-bold'
									>
										<h2 className='font-semibold'>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
									</span>
							}
	
							<div className='flex items-center text-sm'>

								{
									role === 1 ?
										<>
											<Link
												to={ `artists/${ username }` }
												className='opacity-50 hover:opacity-70 transition-opacity duration-100'
												onClick={ () => setOpen(false) }
											>
												Ver perfil
											</Link>
				
											<span className="mx-2 bg-primary dark:bg-bunker-100 w-1 h-1 rounded-full opacity-50"></span>
				
											<Link
												to='profile/edit'
												className='opacity-50 hover:opacity-70 transition-opacity duration-100'
												onClick={ () => setOpen(false) }
											>
												Editar perfil
											</Link>
										</>
									:
										<span className='opacity-50'>Administrador</span>
								}
	
							</div>
	
						</div>
	
					</div>
				
					{
						role === 1 && photo?.url ?
							<div className='hidden dark:block absolute top-0 left-0 w-full h-[50%] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] opacity-60 overflow-hidden -z-10'>
								<figure className='w-full h-full'>
									<img
										src={ photo.url }
										draggable={ false }
										onContextMenu={ e => e.preventDefault() }
										className='w-full h-full object-cover blur-2xl'
									/>
								</figure>
							</div>
						:
							null
					}
	
				</header>
	
				<div className='m-3 h-[2px] bg-gray-200 dark:bg-bunker-700'></div>
	
				<ul>
					{
						USER_OPTIONS.map(({ path, icon, title, danger, onEvents }) =>
							<li key={ path } className={ `text-primary dark:text-bunker-100 ${ danger ? 'hover:text-red-600' : '' }` }>
								<Link
									to={ path }
									aria-label={ title }
									className={ `flex items-center justify-start px-4 py-2 font-medium rounded gap-4 transition-colors duration-150 ${ danger ? 'hover:bg-red-500/5' : 'hover:bg-link-water-100 dark:hover:bg-bunker-900' }` }
									{ ...onEvents }
								>
									{ icon }
									<span>{ title }</span>
								</Link>
							</li>
						)
					}
				</ul>

			</div>

		</section>
	);
});

const UserNav = ({ user, pathname, state }) => {
	const { username, photo, role } = user;
	const { adminAPI: { getReport }, useTheme: { isDark } } = state;
	const [ open, setOpen ] = useState(false);
	const [ loading, setLoading ] = useState(false);
	const { lockScroll, unlockScroll } = useScrollLock();
	const dropdownRef = useRef(null);

	const handleOpen = e => {
		e.stopPropagation();
		e.preventDefault();
		!open ? lockScroll() : unlockScroll();
		setOpen(!open);
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleClick = e => {
		if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
		setOpen(false);
		unlockScroll();
		e.stopImmediatePropagation();
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleKeyDown = e => {
		const { key } = e;
		if (key === "Escape") {
			setOpen(false);
			unlockScroll();
			document.removeEventListener('click', handleClick, false);
			document.removeEventListener('keydown', handleKeyDown, false);
		};
	};

	const downloadReport = async e => {
		if (loading) return;

		setLoading(true);

		const data = await toast.promise(getReport(), {
			loading: 'Generando reporte...',
			success: 'Reporte generado exitosamente',
			error: 'Ocurrió un error al generar el reporte'
		});

		const link = document.createElement('a');
		link.href = data.content;
		link.download = 'Reporte.pdf';
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);

		setLoading(false);
	};

	useEffect(() => {
		if (open) {
			document.addEventListener('click', handleClick, false);
			document.addEventListener('keydown', handleKeyDown, false);
		};
	}, [ open ]);

	const USER_PAGES = [
		{
			path: 'new',
			title: 'Crear publicación',
			mainElement: <SquareRoundedPlus className='w-[1.6rem] text-secondary dark:text-bunker-800 transition-colors duration-100' strokeWidth='1.7' />,
			onEvents: {
				onContextMenu: e => e.preventDefault()
			},
			nav: true,
			roles: [ 1 ]
		},
		{
			path: 'report',
			title: loading ? 'Generando reporte' : 'Reporte diario',
			mainElement: loading ? <Loading size="25" color={ isDark ? 'var(--bg-color)' : 'var(--color-primary)' } stroke="2.5" /> : <ReportAnalytics className='w-[1.6rem] text-secondary dark:text-bunker-800 transition-colors duration-100' strokeWidth='1.7' />,
			onEvents: {
				onClick: downloadReport,
				onContextMenu: e => e.preventDefault()
			},
			button: true,
			roles: [ 0 ]
		},
		{
			path: `artist/${ username }`,
			mainElement: <UserPhoto photo={ photo } />,
			onEvents: {
				onClick: handleOpen,
				onContextMenu: e => e.preventDefault()
			},
			elements: <>
				{ open ? <UserDropdown user={ user } ref={ dropdownRef } setOpen={ setOpen } state={ state } /> : null }
			</>,
			roles: [ 0, 1 ]
		}
	];

	return (
		<nav className='h-full'>
			<ul className='flex items-center h-full'>
				{
					USER_PAGES.filter(({ roles }) => roles.includes(role)).map(({ path, title, mainElement, onEvents, elements, nav, button }) =>
						<li key={ path } className={ `hidden h-full relative ${ nav || button ? 'lg:list-item' : '!list-item'  }` }>
							{
								!button ?
									<Link
										to={ path }
										data-tooltip-content={ title && `/${ path }` !== pathname ? title : '' }
										data-tooltip-place='bottom'
										data-tooltip-id='my-tooltip'
										className={ `${ `/${ path }` === pathname ? 'pointer-events-none after:opacity-100 [&_svg]:dark:text-bunker-400' : '' } ${ nav ? 'after:absolute after:bottom-0 after:w-full after:h-[2px] after:bg-accent-500 after:transition-opacity after:duration-100 after:opacity-0 [&:hover_svg]:dark:text-bunker-400 hover:after:opacity-100' : '' } flex items-center justify-center relative h-full aspect-square select-none` }
										{ ...onEvents }
									>
										{ mainElement }
									</Link>
								:
									<button
										type='button'
										data-tooltip-content={ title }
										data-tooltip-place='bottom'
										data-tooltip-id='my-tooltip'
										className={ `after:absolute after:bottom-0 after:w-full after:h-[2px] after:bg-accent-500 after:transition-opacity after:duration-100 after:opacity-0 [&:hover_svg]:dark:text-bunker-400 hover:after:opacity-100 flex items-center justify-center relative h-full aspect-square select-none ${ loading ? 'cursor-not-allowed after:opacity-100' : '' }` }
										{ ...onEvents }
									>
										{ mainElement }
									</button>
							}

							{ elements ? elements : null }
						</li>
					)
				}
			</ul>
		</nav>
	);
};

const Nav = ({ pathname }) => {
	const PAGES = [
		{
			path: "login",
			name: "Ingresar",
			accent: true
		}
	];

	return (
		<nav className='mr-4 lg:mr-0 h-full'>
			<ul className='flex items-center h-full'>
				{
					PAGES.map(({ path, name, accent }) =>
						<li key={ path } className={ `flex ${ accent ? 'text-mercury-100' : '' }` }>
							<Link
								to={ path }
								className={ `${ `/${ path }` === pathname ? 'pointer-events-none brightness-110' : '' } ${ accent ? 'gradient transition-[filter] duration-100 hover:brightness-110' : '' } py-2 px-4 rounded-lg font-medium select-none` }
								aria-label={ name }
							>
								<span>{ name }</span>
							</Link>
						</li>
					)
				}
			</ul>
		</nav>
	);
};

const MenuDropdown = ({ pathname, loading, userAPI, useTheme, getReport, ...props }) => {
	const { isDark, toggleTheme } = useTheme;
	const { user: [ { user, isLogged } ] } = userAPI;
	const { lockScroll, unlockScroll } = useScrollLock();
	const [ open, setOpen ] = useState(false);
	const [ fetching, setFetching ] = useState(false);
	const dropdownRef = useRef(null);

	const handleOpen = e => {
		e.stopPropagation();
		e.preventDefault();
		!open ? lockScroll() : unlockScroll();
		setOpen(!open);
		document.removeEventListener('click', handleClick, false);
	};

	const handleClick = e => {
		if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
		setOpen(false);
		unlockScroll();
		e.stopImmediatePropagation();
		document.removeEventListener('click', handleClick, false);
	};

	const downloadReport = async e => {
		if (fetching) return;

		setFetching(true);

		const data = await toast.promise(getReport(), {
			loading: 'Generando reporte...',
			success: 'Reporte generado exitosamente',
			error: 'Ocurrió un error al generar el reporte'
		});

		const link = document.createElement('a');
		link.href = data.content;
		link.download = 'Reporte.pdf';
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);

		setFetching(false);
	};

	const USER_PAGES = [
		{
			path: 'new',
			title: 'Crear publicación',
			element: <SquareRoundedPlus className='w-[1.6rem]' strokeWidth='1.7' />,
			nav: true,
			roles: [ 1 ]
		},
		{
			path: 'report',
			title: 'Reporte diario',
			element: fetching ? <Loading size="25" color='var(--purple)' stroke="1.7" /> : <ReportAnalytics className='w-[1.6rem]' strokeWidth='1.7' />,
			onEvents: {
				onClick: downloadReport
			},
			button: true,
			roles: [ 0 ]
		}
	];

	const PAGES = [
		{
			path: "register",
			name: "Registrarse",
			icon: <Edit className='w-6' />
		}
	];

	useEffect(() => {
		if (open) document.addEventListener('click', handleClick, false);
	}, [ open ]);

	return (
		<div className='ml-4 h-full lg:hidden' { ...props }>

			<div 
				className='flex items-center justify-center h-full aspect-square'
				onClick={ handleOpen }
			>
				{
					!open ?
						<Menu className='w-[1.6rem] text-secondary dark:text-bunker-800 stroke-2' />
					:
						<Cancel className='w-[1.6rem] text-secondary dark:text-bunker-800 stroke-2' />
				}
			</div>

			
			<div
				className={ `${ open ? 'flex' : 'hidden' } flex-col absolute top-[90%] left-0 px-4 py-8 w-full rounded-b bg-mercury-50 dark:bg-bunker-950 gap-4 shadow-lg z-50` }
				ref={ dropdownRef }
			>

				{
					loading ?
						<Loading size="25" color="var(--purple)" stroke="2.5" />
					:
						<ul className='flex items-center justify-between w-full'>
							{
								isLogged ?
									USER_PAGES.filter(({ roles }) => roles.includes(user.role)).map(({ path, title, element, onEvents, nav, button }) =>
										<li
											key={ path }
											className={ `h-full ${ `/${ path }` === pathname ? 'text-accent-500' : 'text-secondary dark:text-bunker-800' }` }
										>
											{
												!button ?
													<Link
														to={ path }
														data-tooltip-content={ title && `/${ path }` !== pathname ? title : '' }
														data-tooltip-place='bottom'
														data-tooltip-id='my-tooltip'
														className={ ` ${ `/${ path }` === pathname ? 'pointer-events-none' : '' } ${ nav ? 'transition-colors duration-100' : '' } flex items-center justify-center h-full aspect-square select-none` }
														onClick={ () => {
															setOpen(false);
															unlockScroll();
															document.removeEventListener('click', handleClick, false);
														}}
													>
														{ element }
													</Link>
												:
													<button
														type='button'
														data-tooltip-content={ title }
														data-tooltip-place='bottom'
														data-tooltip-id='my-tooltip'
														className='flex items-center justify-center h-full aspect-square select-none'
														{ ...onEvents }
													>
														{ element }
													</button>
											}
										</li>
									)
								:
									PAGES.map(({ path, name, icon }) =>
										<li
											key={ path }
											className={ `${ `/${ path }` === pathname ? 'text-accent-500' : 'text-secondary dark:text-bunker-800' } transition-colors duration-100` }
										>
											<Link
												to={ path }
												className={ `${ `/${ path }` === pathname ? 'pointer-events-none' : '' } flex p-2 rounded-lg font-medium select-none gap-2` }
												aria-label={ name }
												onClick={ () => {
													setOpen(false);
													unlockScroll();
													document.removeEventListener('click', handleClick, false);
												}}
											>
												{ icon ? icon : null }
												<span>{ name }</span>
											</Link>
										</li>
									)
							}
						</ul>
				}

				<Search className='!min-w-0' id='mb-search' />

				<div className='m-3 h-px bg-gray-200 dark:bg-bunker-700'></div>
				
				<div className='flex items-center justify-between w-full'>

					<span className='font-medium text-secondary dark:text-bunker-800'>Cambiar tema:</span>

					<button
						type="button"
						onClick={ toggleTheme }
						className='flex items-center justify-center px-4 py-2 h-full rounded text-mercury-100 bg-accent-500 gap-2 [&_svg]:pointer-events-none'
					>
						
						{ 
							isDark ?
								<Sun className='w-[1.3rem] stroke-2' />
							:
								<Moon className='w-[1.3rem] stroke-2' />
						}

						<span>{ isDark ? "Claro" : "Oscuro" }</span>

					</button>

				</div>

			</div>

		</div>
	);
};

const Header = () => {
	const { pathname } = useLocation();
	const state = useContext(GlobalState);
	const { userAPI, adminAPI: { getReport }, loading: [ loadingState ], useTheme } = state;
	const { user: [ { user, isLogged } ] } = userAPI;
	const { isDark, toggleTheme } = useTheme;
	const [ loading, setLoading ] = useState(loadingState);

	useEffect(() => {
		if (user || !loadingState) setLoading(false);
	}, [ user, loadingState ]);

	return (
		<header className='flex items-center justify-between fixed top-0 lg:px-16 lg:pr-20 w-screen h-16 border-b-gray-200 dark:border-b-bunker-900/50 border-b-[1px] bg-mercury-50 dark:bg-bunker-950 z-50'>

			<div className='hidden lg:flex w-full h-full items-center justify-between'>
				<div className='flex items-center justify-start h-full py-3 gap-16'>
	
					<h2 className='text-xl font-extrabold text-primary dark:text-mercury-100'>
						<Link
							to=".."
							data-tooltip-content="Inicio"
							data-tooltip-place='bottom'
							data-tooltip-id='my-tooltip'
							className={ `flex items-center gap-2 [&_svg]:w-9 ${ pathname === '/' ? 'pointer-events-none' : '' } select-none` }
							aria-label="Inicio"
						>
							<Palette />
							ArtGallery
						</Link>
					</h2>
	
					<Search />
	
				</div>
	
				{
					loading ?
						<div className='flex pr-5'>
							<Loading size="25" color="var(--purple)" stroke="2.5" />
						</div>
					:
						isLogged ?
							<UserNav user={ user } pathname={ pathname } state={ state } />
						:
							<Nav pathname={ pathname } />
				}

				<button
					type="button"
					onClick={ toggleTheme }
					className='flex items-center justify-center absolute lg:right-[1.6rem] px-3 h-full outline-none text-accent-500'
				>
					{ 
						isDark ?
							<Sun className='w-[1.3rem] stroke-2' />
						:
							<Moon className='w-[1.3rem] stroke-2' />
					}
				</button>
				
			</div>

			<div className='flex items-center justify-between relative w-full h-full lg:hidden'>

				<MenuDropdown
					pathname={ pathname }
					loading={ loading }
					userAPI={ userAPI }
					useTheme={ useTheme }
					getReport={ getReport }
				/>
	
				<div className='flex items-center justify-center absolute left-[calc(50%-calc(var(--header-height)/2))] h-full aspect-square text-xl font-black text-primary dark:text-mercury-100'>
					<Link
						to=".."
						className={ `flex items-center gap-2 [&_svg]:w-9 ${ pathname === '/' ? 'pointer-events-none' : '' } select-none` }
						aria-label="Inicio"
					>
						<Palette />
					</Link>
				</div>
	
				{
					loading ?
						<div className='flex pr-4'>
							<Loading size="25" color="var(--purple)" stroke="2.5" />
						</div>
					:
						isLogged ?
							<UserNav user={ user } pathname={ pathname } state={ state } />
						:
							<Nav pathname={ pathname } />
				}

			</div>

		</header>
	);
};

export default Header;