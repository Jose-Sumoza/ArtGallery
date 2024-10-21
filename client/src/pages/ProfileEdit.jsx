import { useState, useEffect, useContext, useReducer, useRef } from "react";
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { GlobalState } from '@/GlobalState';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import MissingPhoto from '@/components/MissingPhoto';
import Photo from "@components/Photo";
import { ArrowUp, User, FloppyDisk, Settings, View, ViewOff } from '@icons';

const reducer = (current, update) => ({...current, ...update});

const ProfileTab = ({ user, state }) => {
	const { userAPI: { user: [ , setUserState ], updateUser } } = state;
	const { names, lastnames, photo, headline, summary } = user;
	const [ profileData, setProfileData ] = useReducer(reducer, {
		names,
		lastnames,
		headline,
		summary
	});
	const [ loading, setLoading ] = useState(false);
	const [ loadingImage, setLoadingImage ] = useState(false);

	const onChange = e => {
		const { name, value } = e.target;

		setProfileData({
			[ name ]: value
		});
	};

	const onSubmit = async e => {
	    if (loading || loadingImage) return e.preventDefault();

		e.preventDefault();
        setLoading(true);

		const formData = new FormData();

		Object.entries(profileData).forEach(([ key, value ]) => formData.append(key, value));

		const data = await updateUser(formData);

		const { status, success, content } = data;

		if (status === 500) {
			toast.error("Error en el servidor.");
			return setLoading(false);
		};

		if (!success) {
		    toast.error(content);
			return setLoading(false);
		};
		
		setLoading(false);
		toast.success('Cuenta actualizada exitosamente.');

		return setUserState({ user: content });
	};

	const fileHandler = async e => {
		const file = e.target.files[0];
		if (!file) return;

	    if (loading || loadingImage) return e.preventDefault();

		e.preventDefault();
        setLoadingImage(true);

		const formData = new FormData();

		formData.append('images', file);

		const data = await updateUser(formData);

		const { status, success, content } = data;

		if (status === 500) {
			toast.error("Error en el servidor.");
			return setLoadingImage(false);
		};

		if (!success) {
		    toast.error(content);
			return setLoadingImage(false);
		};
		
		setLoadingImage(false);
		toast.success('Cuenta actualizada exitosamente.');

		return setUserState({ user: content });
	};

	return (
		<>
			<header className='flex flex-col px-7 py-4 w-full bg-link-water-200 gap-6'>
				<h1 className="text-3xl font-bold">Perfil</h1>
				<p className='opacity-80'>Complete su información</p>
			</header>

			<Form onSubmit={ onSubmit } className='group flex flex-col items-start justify-start p-8 w-full bg-link-water-50 gap-16'>

				<Fieldset classNames={{ content: 'mt-auto !gap-6' }}>
					
					<div className='flex lg:!flex-row justify-between gap-6'>

						<div className='flex flex-col w-full gap-6'>
	
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='names'
									className='font-medium after:content-["_*"] after:text-red-500'
								>
									Nombres
								</Fieldset.Field.Label>
		
								<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>
		
									<Fieldset.Field.Container.Input
										type='text'
										name="names"
										id="names"
										placeholder=" "
										value={ profileData.names }
										onChange={ onChange }
										minLength={ 3 }
										maxLength={ 30 }
										required
										disabled={ loading || loadingImage }
										className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
									/>
		
								</Fieldset.Field.Container>
								
							</Fieldset.Field>
							
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='lastnames'
									className='font-medium after:content-["_*"] after:text-red-500'
								>
									Apellidos
								</Fieldset.Field.Label>
		
								<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>
		
									<Fieldset.Field.Container.Input
										type='text'
										name="lastnames"
										id="lastnames"
										placeholder=" "
										value={ profileData.lastnames }
										onChange={ onChange }
										minLength={ 3 }
										maxLength={ 20 }
										required
										disabled={ loading || loadingImage }
										className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
									/>
		
								</Fieldset.Field.Container>
								
							</Fieldset.Field>
							
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='headline'
									className='font-medium'
								>
									Título profesional
								</Fieldset.Field.Label>
		
								<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>
		
									<Fieldset.Field.Container.Input
										placeholder='P. ej. Artista plástico'
										type='text'
										name="headline"
										id="headline"
										value={ profileData.headline }
										minLength={ 3 }
										maxLength={ 60 }
										onChange={ onChange }
										disabled={ loading || loadingImage }
										className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
									/>
		
								</Fieldset.Field.Container>
								
							</Fieldset.Field>
	
						</div>
	
						<div className='flex flex-col w-full gap-6'>
							
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='photo'
									className='font-medium'
								>
									Foto de perfil
								</Fieldset.Field.Label>
		
								<Fieldset.Field.Container className='flex items-center justify-center relative p-4 border border-link-water-300 rounded group-valid:hover:border-accent transition-colors duration-100 [&_l-ring]:absolute'>
	
									{ loadingImage ? <Loading size="16" stroke="2" color="var(--color-accent)" /> : null }
	
									<div className={ `flex flex-col items-center justify-center w-full gap-4 ${ loadingImage ? 'opacity-0 pointer-events-none' : '' }` }>
	
										<figure>
											{
												photo?.url ?
													<Photo src={ photo.url } />
												:
													<MissingPhoto className='w-32 rounded-full' />
											}
										</figure>
											
										<div className={ `flex items-center justify-center relative px-4 py-2 w-fit border border-link-water-300 rounded bg-link-water-50 group-valid:hover:bg-link-water-300 group-valid:hover:border-link-water-400 transition-[filter_color_border-color] duration-100 overflow-hidden gap-2 ${ loading || loadingImage ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:!border-link-water-300' : '' }` }>
		
											<ArrowUp className='w-4 h-4 text-accent' />
		
											<span className='text-sm text-primary font-semibold'>Subir nueva foto de perfil</span>
		
											<Fieldset.Field.Container.Input
												title=''
												type='file'
												name='photo'
												id='photo'
												accept='image/jpg,image/jpeg,image/png,image/webp'
												onChange={ fileHandler }
												disabled={ loading || loadingImage }
												className={ `!w-auto absolute top-0 right-0 h-full text-9xl opacity-0  ${ loading || loadingImage ? 'cursor-not-allowed' : 'cursor-pointer' }` }
											/>
		
										</div>
	
									</div>
		
								</Fieldset.Field.Container>
								
							</Fieldset.Field>
	
						</div>

					</div>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='summary'
							className='font-medium'
						>
							Resumen
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

							<Fieldset.Field.Container.TextArea
								name='summary'
								id='summary'
								placeholder='Un resumen de tus habilidades profesionales y experiencia como artista.'
								value={ profileData.summary }
								onChange={ onChange }
								rows={ 3 }
								maxLength={ 128 }
								disabled={ loading || loadingImage }
								className='!px-4 !py-2 resize-none border border-link-water-200 !rounded bg-link-water-100 transition-colors duration-100 focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
							/>

						</Fieldset.Field.Container>
						
					</Fieldset.Field>

				</Fieldset>

				<Form.Footer className='flex flex-col w-full'>

					<Form.Footer.Buttons>

						<button
							type='submit'
							className={ `flex items-center justify-center px-4 py-2 w-fit border border-link-water-300 rounded bg-link-water-50 group-valid:hover:bg-link-water-300 group-valid:hover:border-link-water-400 transition-[filter_color_border-color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:opacity-50 ${ loading || loadingImage ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:!border-link-water-300' : '' }` }
						>

							<span className='flex items-center relative text-sm text-primary font-semibold gap-2'>

								{ 
									loading ?
										<Loading size="16" stroke="2" color="var(--color-accent)" />
									:
										<FloppyDisk className='w-4 text-accent' />
								}

								Guardar

							</span>

						</button>

					</Form.Footer.Buttons>

				</Form.Footer>

			</Form>
		</>
	);
};

const AccountTab = ({ user, state }) => {
	const { userAPI: { user: [ , setUserState ], updateEmail } } = state;
	const { email } = user;
	const [ profileData, setProfileData ] = useReducer(reducer, {
		email,
		password: ''
	});
	const [ loading, setLoading ] = useState(false);
	const [ showPass, setShowPass ] = useState(false);
	const passwordRef = useRef(null);

	const onChange = e => {
		const { name, value } = e.target;

		setProfileData({
			[ name ]: value
		});
	};

	const onSubmit = async e => {
	    if (loading || email === profileData.email) return e.preventDefault();

		e.preventDefault();
        setLoading(true);

		const data = await updateEmail(profileData);

		const { status, success, content } = data;

		if (status === 500) {
			toast.error("Error en el servidor.");
			return setLoading(false);
		};

		if (!success) {
		    toast.error(content);
			return setLoading(false);
		};
		
		setLoading(false);
		toast.success('Cuenta actualizada exitosamente.');

		return setUserState({ user: content });
	};

	const onBlur = e => {
		e.preventDefault();
		if (e.relatedTarget && e.relatedTarget.classList.contains("input__showPassword")) passwordRef.current.focus();
	};

	return (
		<>
			<header className='flex flex-col px-7 py-4 w-full bg-link-water-200 gap-6'>
				<h1 className="text-3xl font-bold">Cuenta</h1>
				<p className='opacity-80'>Configuraciones</p>
			</header>

			<Form onSubmit={ onSubmit } className='group flex flex-col lg:flex-row items-start justify-start p-8 w-full bg-link-water-50 gap-6'>

				<div>
					<h3 className="text-lg font-medium">Correo de Acceso</h3>
					<p className="text-sm opacity-90">El correo que usas para acceder a ArtGallery</p>
				</div>

				<div className='flex flex-col w-full gap-6'>

					<Fieldset classNames={{ content: 'mt-auto !gap-6' }}>
						
						<Fieldset.Field className='gap-2'>
			
							<Fieldset.Field.Label
								htmlFor='email'
								className='font-medium after:content-["_*"] after:text-red-500'
							>
								Correo electrónico
							</Fieldset.Field.Label>
			
							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>
			
								<Fieldset.Field.Container.Input
									type='email'
									name="email"
									id="email"
									placeholder=" "
									value={ profileData.email }
									onChange={ onChange }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
								/>
			
							</Fieldset.Field.Container>
									
						</Fieldset.Field>
						
						{
							email !== profileData.email ?
								<Fieldset.Field className='gap-2'>
				
									<Fieldset.Field.Label
										htmlFor='password'
										className='font-medium after:content-["_*"] after:text-red-500'
									>
										Por favor ingresa tu contraseña para cambiar el correo electrónico
									</Fieldset.Field.Label>
	
									<Fieldset.Field.Container onEvents={{ onBlur }} className='flex flex-col !items-start gap-1'>
	
										<Fieldset.Field.Container.Input
											className={ `peer ${ profileData.password.length ? 'filled' : '' } !px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed` }
											placeholder='Tu contraseña actual'
											type={ showPass ? 'text' : 'password' }
											name="password"
											id="password"
											value={ profileData.password }
											onChange={ onChange }
											onFocus={ e => e.currentTarget.selectionStart = e.currentTarget.value.length }
											minLength={ 6 }
											required
											ref={ passwordRef }
											disabled={ loading }
										/>
	
										<div
											className='input__showPassword flex items-center justify-center absolute right-0 w-14 h-full text-primary opacity-0 pointer-events-none transition-opacity duration-100 select-none peer-focus:opacity-100 peer-[.filled]:opacity-100 peer-focus:pointer-events-auto peer-[.filled]:pointer-events-auto peer-focus:cursor-pointer peer-[.filled]:cursor-pointer'
											onClick={ () => setShowPass(!showPass) }
											onMouseUp={ e => e.preventDefault() }
											tabIndex="1"
										>
											{ showPass ? <View /> : <ViewOff /> }
										</div>
									</Fieldset.Field.Container>
											
								</Fieldset.Field>
							:
								null
						}
	
					</Fieldset>
	
					{
						email !== profileData.email ?
							<Form.Footer className='flex flex-col w-full'>
	
								<Form.Footer.Buttons>
	
									<button
										type='submit'
										className={ `flex items-center justify-center px-4 py-2 w-fit border border-link-water-300 rounded bg-link-water-50 group-valid:hover:bg-link-water-300 group-valid:hover:border-link-water-400 transition-[filter_color_border-color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:!border-link-water-300' : '' }` }
									>
	
										<span className='flex items-center relative text-sm text-primary font-semibold gap-2'>
	
											{ 
												loading ?
													<Loading size="16" stroke="2" color="var(--color-accent)" />
												:
													<FloppyDisk className='w-4 text-accent' />
											}
	
											Guardar
	
										</span>
	
									</button>
	
								</Form.Footer.Buttons>
	
							</Form.Footer>
						:
							null
					}
					
				</div>

			</Form>
		</>
	);
};

const PROFILE_OPTIONS = [
	{
		label: "edit",
		title: "Perfil",
		Icon: User,
		content: ProfileTab
	},
	{
		divider: true
	},
	{
		label: "settings",
		title: "Cuenta",
		Icon: Settings,
		content: AccountTab
	}
];

export const ProfileEdit = () => {
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const params = useParams();
	const { userAPI: { user: [ { user } ] }, loading: [ loadingState ] } = state;
	const [ loading, setLoading ] = useState(loadingState);

	if (!PROFILE_OPTIONS.find(({ label }) => label === params?.setting)) {
		toast.error('Ha ocurrido un error');
		return <Navigate to='/' replace />;
	};
	
	const { setting } = params;

	useEffect(() => {
		if (user || !loadingState) setLoading(false);
	}, [ user, loadingState ]);

	if (loading) return (
		<main className='flex items-center justify-center w-full'>
			<Loading size="150" color="var(--color-primary)" stroke="5" />
		</main>
	);

	const { names, lastnames, username, photo, createdAt } = user;

	const createdDate = DateTime.fromISO(createdAt).setLocale('es-VE');
	const month = createdDate.toLocaleString({ month: 'long' });

	const { content: CurrentTab } = PROFILE_OPTIONS.find(({ label }) => label === setting);

	return (
		<main className='flex flex-col items-center lg:flex-row lg:items-start justify-start w-full h-full gap-8 overflow-hidden'>

			<section className='flex flex-col items-center justify-start w-full lg:w-auto h-full gap-8 lg:gap-4'>

				<header className='flex flex-col items-center lg:flex-row justify-start flex-[1_1_0] gap-2'>
	
					<Link
						to={ `/artists/${ username }` }
						aria-label={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
					>
						<figure>
							{
								photo?.url ?
									<Photo src={ photo.url } className='w-44 lg:w-24' />
								:
									<MissingPhoto className='w-24 rounded-full' />
							}
						</figure>
					</Link>
	
					<div className='flex flex-col items-center lg:items-start justify-center h-full gap-1'>
							
						<span className="text-xs font-medium uppercase opacity-70">Configuración</span>
	
						<Link
							to={ `/artists/${ username }` }
							aria-label={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
							className='text-2xl font-bold'
						>
							<h2>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
						</Link>
	
						<time className='text-xs opacity-80'>
							Miembro desde { `${ month[0].toUpperCase() }${ month.slice(1) }` } { createdDate.year }
						</time>
	
					</div>
	
				</header>
	
				<ul className='flex lg:flex-col w-full h-full bg-link-water-100 lg:bg-transparent lg:gap-2'>
					{
						PROFILE_OPTIONS.map(({ label, title, Icon, divider }, ind) =>
							!divider ?
								<li key={ label }>
									<button
										onClick={ () => navigate(`/profile/${ label }`) }
										className={ `group flex items-center justify-start relative px-5 py-3 w-full lg:rounded-sm overflow-hidden gap-2 hover:bg-link-water-100 ${ label === setting ? 'bg-link-water-100 pointer-events-none after:absolute after:top-0 after:left-0 after:w-full after:h-[3px] lg:after:w-[3px] lg:after:h-full after:bg-accent' : '' }` }
									>
										<Icon className={ `w-5 transition-colors duration-100 group-hover:text-accent ${ label === setting ? 'text-accent' : '' }` } />
										<span className={ `font-medium opacity-70 transition-opacity duration-100 group-hover:opacity-100 ${ label === setting ? '!opacity-100' : '' }` }>{ title }</span>
									</button>
								</li>
							:
								<div key={ `ind-${ ind }` } className='mx-1 my-3 lg:m-5 w-[2px] h-auto lg:h-px lg:w-auto bg-link-water-200'></div>
						)
					}
				</ul>
			</section>

			<section className='flex flex-col flex-1 items-start justify-start w-full h-full rounded overflow-hidden'>
				<CurrentTab user={ user } state={ state } />
			</section>

		</main>
	);
};