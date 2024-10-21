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
import { Cancel, Edit, Logout, Menu, Settings, SquareRoundedPlus } from '@icons';

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
	const { names, lastnames, username, photo } = user;
	const { token, userAPI: { user: [ , setUserState ] }, setLogged } = state;

	const logout = async e => {
		try {
			e.preventDefault();
			await axios.get('/user/logout', {
				headers: { Authorization: token }
			});

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
		<section className='flex flex-col absolute top-[90%] right-2 lg:-right-8 p-2 min-w-72 rounded-lg bg-white shadow-lg z-50' ref={ ref }>

			<header className='mx-4 mt-4'>
				<div className='flex items-center gap-2'>

					<Link
						to={ `artists/${ username }` }
						data-tooltip-content={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
						data-tooltip-place='left'
						data-tooltip-id='my-tooltip'
						aria-label={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
						onClick={ () => setOpen(false) }
					>
						<UserPhoto photo={ photo } />
					</Link>

					<div className='flex flex-col justify-start h-full'>

						<Link
							to={ `artists/${ username }` }
							className='text-sm font-bold hover:text-accent transition-colors duration-100'
							onClick={ () => setOpen(false) }
						>
							<h2 className='font-semibold'>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
						</Link>

						<div className='flex items-center text-sm'>

							<Link
								to={ `artists/${ username }` }
								className='opacity-50 hover:opacity-70 transition-opacity duration-100'
								onClick={ () => setOpen(false) }
							>
								Ver perfil
							</Link>

							<span className="mx-2 bg-primary w-1 h-1 rounded-full opacity-50"></span>

							<Link
								to='profile/edit'
								className='opacity-50 hover:opacity-70 transition-opacity duration-100'
								onClick={ () => setOpen(false) }
							>
								Editar perfil
							</Link>

						</div>

					</div>

				</div>
			</header>

			<div className='m-3 h-[2px] border-gray-200 border'></div>

			<ul>
				{
					USER_OPTIONS.map(({ path, icon, title, danger, onEvents }) =>
						<li key={ path }>
							<Link
								to={ path }
								aria-label={ title }
								className={ `flex items-center justify-start px-4 py-2 text-primary font-medium rounded gap-4 transition-colors duration-150 ${ danger ? 'hover:bg-red-100 hover:text-red-600' : 'hover:bg-link-water-100' }` }
								{ ...onEvents }
							>
								{ icon }
								<span>{ title }</span>
							</Link>
						</li>
					)
				}
			</ul>

		</section>
	);
});

const UserNav = ({ user, pathname, state }) => {
	const { username, photo } = user;
	const [ open, setOpen ] = useState(false);
	const dropdownRef = useRef(null);

	const handleOpen = e => {
		e.stopPropagation();
		e.preventDefault();
		setOpen(!open);
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleClick = e => {
		if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
		setOpen(false);
		e.stopImmediatePropagation();
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleKeyDown = e => {
		const { key } = e;
		if (key === "Escape") {
			setOpen(false);
			document.removeEventListener('click', handleClick, false);
			document.removeEventListener('keydown', handleKeyDown, false);
		};
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
			mainElement: <SquareRoundedPlus className='w-[1.6rem] text-secondary' strokeWidth='1.7' />,
			onEvents: {
				onContextMenu: e => e.preventDefault()
			},
			nav: true
		},
		{
			path: `artist/${ username }`,
			mainElement: <UserPhoto photo={ photo } />,
			onEvents: {
				onClick: handleOpen
			},
			elements: <>
				{ open ? <UserDropdown user={ user } ref={ dropdownRef } setOpen={ setOpen } state={ state } /> : null }
			</>
		}
	];

	return (
		<nav className='h-full'>
			<ul className='flex items-center h-full'>
				{
					USER_PAGES.map(({ path, title, mainElement, onEvents, elements, nav }) =>
						<li key={ path } className={ `hidden h-full relative ${ nav ? 'lg:list-item' : '!list-item'  }` }>
							<Link
								to={ path }
								data-tooltip-content={ title && `/${ path }` !== pathname ? title : '' }
								data-tooltip-place='bottom'
								data-tooltip-id='my-tooltip'
								className={ `${ `/${ path }` === pathname ? 'pointer-events-none after:!block opacity-100' : '' } ${ nav ? 'opacity-70 after:hidden after:absolute after:bottom-0 after:w-full after:h-[2px] after:bg-accent transition-opacity duration-100 hover:opacity-100 hover:after:block' : '' } flex items-center justify-center relative h-full rounded-lg aspect-square font-medium select-none` }
								{ ...onEvents }
							>
								{ mainElement }
							</Link>

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
						<li key={ path } className={ `flex ${ accent ? `text-black-haze hover:text-primary ${ `/${ path }` === pathname ? '!text-primary' : '' }` : '' }` }>
							<Link
								to={ path }
								className={ `${ `/${ path }` === pathname ? 'pointer-events-none bg-transparent' : '' } ${ accent ? 'border-2 border-accent bg-accent transition-[filter,background-color,border-color,color] duration-100 hover:bg-transparent' : '' } py-2 px-4 rounded-lg font-medium select-none` }
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

const MenuDropdown = ({ pathname, loading, isLogged, ...props }) => {
	const [ open, setOpen ] = useState(false);
	const dropdownRef = useRef(null);

	const handleOpen = e => {
		e.stopPropagation();
		e.preventDefault();
		setOpen(!open);
		document.removeEventListener('click', handleClick, false);
	};

	const handleClick = e => {
		if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
		setOpen(false);
		e.stopImmediatePropagation();
		document.removeEventListener('click', handleClick, false);
	};

	const USER_PAGES = [
		{
			path: 'new',
			title: 'Crear publicación',
			element: <SquareRoundedPlus className='w-[1.6rem] text-secondary' strokeWidth='1.7' />,
			nav: true
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
						<Menu className='w-[1.6rem] text-secondary' strokeWidth='1.7' />
					:
						<Cancel className='w-[1.6rem] text-secondary' strokeWidth='1.7' />
				}
			</div>

			
			<div
				className={ `${ open ? 'flex' : 'hidden' } flex-col absolute top-[90%] left-0 px-4 py-8 w-full rounded-b bg-black-haze gap-4 shadow-lg z-50` }
				ref={ dropdownRef }
			>

				{
					loading ?
						<Loading size="25" color="var(--color-accent)" stroke="2.5" />
					:
						<ul className='flex items-center justify-between w-full'>
							{
								isLogged ?
									USER_PAGES.map(({ path, title, element, nav }) =>
										<li key={ path } className={ `h-full` }>
											<Link
												to={ path }
												data-tooltip-content={ title && `/${ path }` !== pathname ? title : '' }
												data-tooltip-place='bottom'
												data-tooltip-id='my-tooltip'
												className={ `${ `/${ path }` === pathname ? 'pointer-events-none after:!block opacity-100' : '' } ${ nav ? 'opacity-70 after:hidden after:absolute after:bottom-0 after:w-full after:h-[2px] after:bg-accent transition-opacity duration-100 hover:opacity-100 hover:after:block' : '' } flex items-center justify-center relative h-full rounded-lg aspect-square font-medium select-none` }
												onClick={ () => setOpen(false) }
											>
												{ element }
											</Link>
										</li>
									)
								:
									PAGES.map(({ path, name, icon }) =>
										<li
										key={ path } className={ `text-secondary hover:opacity-100 transition-opacity duration-100 ${ `/${ path }` === pathname ? 'opacity-100' : 'opacity-70' }` }
										>
											<Link
												to={ path }
												className={ `${ `/${ path }` === pathname ? 'pointer-events-none bg-transparent' : '' } flex p-2 rounded-lg font-medium select-none gap-2` }
												aria-label={ name }
												onClick={ () => setOpen(false) }
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

			</div>

		</div>
	);
};

const Header = () => {
	const { pathname } = useLocation();
	const state = useContext(GlobalState);
	const { userAPI, loading: [ loadingState ] } = state;
	const { user: [ { user, isLogged } ] } = userAPI;
	const [ loading, setLoading ] = useState(loadingState);

	useEffect(() => {
		if (user || !loadingState) setLoading(false);
	}, [ user, loadingState ]);

	return (
		<header className='flex items-center justify-between fixed top-0 lg:px-16 w-full h-16 border-b-gray-200 border-b-[1px] bg-black-haze z-50'>

			<div className='hidden lg:flex w-full h-full items-center justify-between'>
				<div className='flex items-center justify-start h-full py-3 gap-16'>
	
					<h2 className='text-xl font-black text-primary'>
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
						<Loading size="25" color="var(--color-accent)" stroke="2.5" />
					:
						isLogged ?
							<UserNav user={ user } pathname={ pathname } state={ state } />
						:
							<Nav pathname={ pathname } />
				}
			</div>

			<div className='flex items-center justify-between relative w-full h-full lg:hidden'>

				<MenuDropdown
					pathname={ pathname }
					loading={ loading }
					isLogged={ isLogged }
				/>
	
				<div className='flex items-center justify-center absolute left-[calc(50%-calc(var(--header-height)/2))] h-full aspect-square text-xl font-black text-primary'>
					<Link
						to=".."
						data-tooltip-content="Inicio"
						data-tooltip-place='bottom'
						data-tooltip-id='my-tooltip'
						className={ `flex items-center gap-2 [&_svg]:w-9 ${ pathname === '/' ? 'pointer-events-none' : '' } select-none` }
						aria-label="Inicio"
					>
						<Palette />
					</Link>
				</div>
	
				{
					loading ?
						<Loading size="25" color="var(--color-accent)" stroke="2.5" />
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