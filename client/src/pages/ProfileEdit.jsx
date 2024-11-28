import { useState, useEffect, useContext, useReducer, useRef } from "react";
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { PhoneInput } from "react-international-phone";
import { PhoneNumberUtil } from 'google-libphonenumber';
import { DateTime } from "luxon";
import { GlobalState } from '@/GlobalState';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import MissingPhoto from '@/components/MissingPhoto';
import Photo from "@components/Photo";
import VALIDATIONS from '@consts/validations';
import { ArrowUp, ExclamationCircle, FloppyDisk, Settings, Share, User, View, ViewOff } from '@icons';
import 'react-international-phone/style.css';

const phoneUtil = PhoneNumberUtil.getInstance();
const reducer = (current, update) => ({...current, ...update});

const isPhoneValid = phone => {
	try {
		return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
	} catch (err) {
		return false;
	}
};

const isIgUrl = v => VALIDATIONS.instagram.url.test(v);
const isIgUrlValid = v => VALIDATIONS.instagram.urlValid.test(v);
const isIgValid = v => VALIDATIONS.instagram.username.test(v);

const isTTkUrl = v => VALIDATIONS.tiktok.url.test(v);
const isTTkUrlValid = v => VALIDATIONS.tiktok.urlValid.test(v);
const isTTkValid = v =>VALIDATIONS. tiktok.username.test(v);

const isFbUrl = v => VALIDATIONS.facebook.url.test(v);
const isFbUrlValid = v => VALIDATIONS.facebook.urlValid.test(v);
const isFbValid = v => VALIDATIONS.facebook.username.test(v);

const isTtUrl = v => VALIDATIONS.twitter.url.test(v);
const isTtUrlValid = v => VALIDATIONS.twitter.urlValid.test(v);
const isTtValid = v => VALIDATIONS.twitter.username.test(v);

const ProfileTab = ({ state }) => {
	const { userAPI: { user: [ { user }, setUserState ], updateUser } } = state;
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

	if (user.role === 0) return <Navigate to='/profile/settings' replace />;

	return (
		<>
			<header className='flex flex-col px-7 py-4 w-full rounded-t bg-link-water-200 dark:bg-bunker-900/30 gap-6'>
				<h1 className="text-3xl font-bold">Perfil</h1>
				<p className='dark:text-bunker-400 opacity-80'>Complete su información</p>
			</header>

			<Form onSubmit={ onSubmit } className='group flex flex-col items-start justify-start p-8 w-full rounded-b bg-link-water-50 dark:bg-bunker-900/50 gap-16'>

				<Fieldset classNames={{ content: 'mt-auto !gap-6' }}>
					
					<div className='flex lg:!flex-row justify-between gap-6'>

						<div className='flex flex-col w-full gap-6'>
	
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='names'
									className='font-medium after:content-["_*"] after:text-accent-500'
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
										className='!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
									/>
		
								</Fieldset.Field.Container>
								
							</Fieldset.Field>
							
							<Fieldset.Field className='gap-2'>
		
								<Fieldset.Field.Label
									htmlFor='lastnames'
									className='font-medium after:content-["_*"] after:text-accent-500'
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
										className='!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
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
										className='!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
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
		
								<Fieldset.Field.Container className='flex items-center justify-center relative p-4 border border-link-water-200 dark:border-bunker-800 rounded group-valid:hover:border-accent-500 transition-colors duration-100 [&_l-ring]:absolute'>
	
									{ loadingImage ? <Loading size="16" stroke="2" color="var(--purple)" /> : null }
	
									<div className={ `flex flex-col items-center justify-center w-full gap-4 ${ loadingImage ? 'opacity-0 pointer-events-none' : '' }` }>
	
										<figure>
											{
												photo?.url ?
													<Photo src={ photo.url } />
												:
													<MissingPhoto className='w-32 rounded-full' />
											}
										</figure>
											
										<div className={ `flex items-center justify-center relative px-4 py-2 w-fit border border-link-water-300 dark:border-bunker-800 rounded bg-link-water-50 dark:bg-bunker-950 group-valid:hover:bg-link-water-300 group-valid:hover:dark:bg-bunker-950/40 group-valid:hover:border-link-water-400 group-valid:hover:dark:border-bunker-700 transition-[filter,color,border-color,background-color] duration-100 overflow-hidden gap-2 ${ loading || loadingImage ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:!border-link-water-300' : '' }` }>
		
											<ArrowUp className='w-4 h-4 text-accent-500' />
		
											<span className='text-sm text-primary dark:text-mercury-100 font-semibold'>Subir nueva foto de perfil</span>
		
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
								className='!px-4 !py-2 resize-none !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
							/>

						</Fieldset.Field.Container>
						
					</Fieldset.Field>

				</Fieldset>

				<Form.Footer className='flex flex-col w-full'>

					<Form.Footer.Buttons>

						<button
							type='submit'
							className={ `flex items-center justify-center px-4 py-2 w-fit border border-link-water-300 dark:border-bunker-800 rounded bg-link-water-50 dark:bg-bunker-950 group-valid:hover:bg-link-water-300 group-valid:hover:dark:bg-bunker-950/40 group-valid:hover:border-link-water-400 group-valid:hover:dark:border-bunker-700 transition-[filter,color,border-color,background-color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:dark:bg-bunker-900 group-invalid:opacity-50 ${ loading || loadingImage ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:dark:!bg-bunker-950 hover:!border-link-water-300 hover:dark:!border-bunker-800' : '' }` }
						>

							<span className='flex items-center relative text-sm text-primary dark:text-mercury-100 font-semibold gap-2'>

								{ 
									loading ?
										<Loading size="16" stroke="2" color="var(--purple)" />
									:
										<FloppyDisk className='w-4 text-accent-500' />
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

const ContactTab = ({ state }) => {
	const { userAPI: { user: [ { user }, setUserState ], updateUser } } = state;
	const { contact: { phone, instagram, tiktok, facebook, twitter, email } } = user;
	const [ profileData, setProfileData ] = useReducer(reducer, {
		phone,
		instagram,
		tiktok,
		facebook,
		twitter,
		email
	});
	const [ loading, setLoading ] = useState(false);

	const phoneValid =
		isPhoneValid(`+${ profileData.phone.dialCode }${ profileData.phone.number }`)
		|| !profileData.phone.number.length;

	const igValid =
		profileData.instagram.length
		&& profileData.instagram.length >= 4
		&& profileData.instagram.length <= 116
		&& (
			( isIgUrl(profileData.instagram) && isIgUrlValid(profileData.instagram) )
			|| 
				( 
					!isIgUrl(profileData.instagram)
					&& profileData.instagram[0] !== '.'
					&& profileData.instagram[ profileData.instagram.length - 1 ] !== '.'
					&& isNaN(Number(profileData.instagram))
					&& isIgValid(profileData.instagram)
				)
		)
		|| !profileData.instagram.length;

	const ttkValid =
		profileData.tiktok.length
		&& profileData.tiktok.length >= 4
		&& profileData.tiktok.length <= 116
		&& (
			( isTTkUrl(profileData.tiktok) && isTTkUrlValid(profileData.tiktok) )
			|| 
				( 
					!isTTkUrl(profileData.tiktok)
					&& profileData.tiktok[ profileData.tiktok.length - 1 ] !== '.'
					&& isNaN(Number(profileData.tiktok))
					&& isTTkValid(profileData.tiktok)
				)
		)
		|| !profileData.tiktok.length;

	const fbValid = 
		profileData.facebook.length >= 5
		&& profileData.facebook.length <= 116
		&& (
			( isFbUrl(profileData.facebook) && isFbUrlValid(profileData.facebook) )
			|| ( !isFbUrl(profileData.facebook) && isFbValid(profileData.facebook) )
		)
		|| !profileData.facebook.length;

	const ttValid =
		profileData.twitter.length
		&& profileData.twitter.length >= 5
		&& profileData.twitter.length <= 116
		&& (
			( isTtUrl(profileData.twitter) && isTtUrlValid(profileData.twitter) )
			|| 
				( 
					!isTtUrl(profileData.twitter)
					&& isNaN(Number(profileData.twitter))
					&& isTtValid(profileData.twitter)
				)
		)
		|| !profileData.twitter.length;

	const formValid = phoneValid && igValid && ttkValid && fbValid && ttValid;

	const onPhoneChange = (_, meta) => {
		const { country, inputValue } = meta;
		const { dialCode, iso2 } = country;

		onChange({
			target: {
				name: 'phone',
				value: {
					dialCode,
					iso2,
					number: inputValue
				}
			}
		});
	};

	const onChange = e => {
		const { name, value } = e.target;

		setProfileData({
			[ name ]: value
		});
	};

	const onSubmit = async e => {
	    if (loading) return e.preventDefault();

		e.preventDefault();

		if (!formValid) {

			if (!phoneValid) return toast.error('El número de teléfono es inválido.');

			if (!igValid) {
				if (isIgUrl(profileData.instagram) && !isIgUrlValid(profileData.instagram)) return toast.error('El Enlace de Instagram es inválido');

				if (!isIgUrl(profileData.instagram) && !isIgValid(profileData.instagram)) return toast.error('El nombre de usuario de Instagram contiene caracteres inválidos');

				if (profileData.instagram[0] === '.' || profileData.instagram[ profileData.instagram.length - 1 ] === '.') return toast.error('El nombre de usuario de Instagram no puede empezar ni terminar con un "."');

				if (!isNaN(Number(profileData.instagram))) return toast.error('El nombre de usuario de Instagram no puede tener solo números');

				if (profileData.instagram.length < 4) return toast.error('El nombre de usuario o enlace de Instagram debe tener como mínimo 4 caracteres');

				if (profileData.instagram.length > 116) return toast.error('El nombre de usuario o enlace de Instagram excede el límite de 116 caracteres');
			};

			if (!ttkValid) {
				if (isTTkUrl(profileData.tiktok) && !isTTkUrlValid(profileData.tiktok)) return toast.error('El Enlace de TikTok es inválido');

				if (!isTTkUrl(profileData.tiktok) && !isTTkValid(profileData.tiktok)) return toast.error('El nombre de usuario de TikTok contiene caracteres inválidos');

				if (profileData.tiktok.length && profileData.tiktok[ profileData.tiktok.length - 1 ] === '.') return toast.error('El nombre de usuario de TikTok no puede terminar con un "."');

				if (!isNaN(Number(profileData.tiktok))) return toast.error('El nombre de usuario de TikTok no puede tener solo números');

				if (profileData.tiktok.length && profileData.tiktok.length < 4) return toast.error('El nombre de usuario o enlace de TikTok debe tener como mínimo 4 caracteres');

				if (profileData.tiktok.length > 116) return toast.error('El nombre de usuario o enlace de TikTok excede el límite de 24 caracteres');
			};

			if (!fbValid) {
				if (isFbUrl(profileData.facebook) && !isFbUrlValid(profileData.facebook)) return toast.error('El Enlace de Facebook es inválido');

				if (!isFbUrl(profileData.facebook) && !isFbValid(profileData.facebook)) return toast.error('El nombre de Facebook contiene caracteres inválidos');

				if (profileData.facebook.length < 5) return toast.error('El enlace o nombre de Facebook debe tener mínimo 5 caracteres');

				if (profileData.facebook.length > 116) return toast.error('El enlace o nombre de Facebook excede el límite de 116 caracteres');
			};

			if (!ttValid) {
				if (isTtUrl(profileData.twitter) && !isTtUrlValid(profileData.twitter)) return toast.error('El Enlace de Twitter es inválido');

				if (!isTtUrl(profileData.twitter) && !isTtValid(profileData.twitter)) return toast.error('El nombre de usuario de Twitter contiene caracteres inválidos');

				if (!isNaN(Number(profileData.twitter))) return toast.error('El nombre de usuario de Twitter no puede tener solo números');

				if (profileData.twitter.length && profileData.twitter.length < 5) return toast.error('El nombre de usuario o enlace de Twitter debe tener como mínimo 5 caracteres');

				if (profileData.twitter.length > 116) return toast.error('El nombre de usuario o enlace de Twitter excede el límite de 116 caracteres');
			};
		};

        setLoading(true);

		try {
			const formData = new FormData();
	
			formData.append('contact', JSON.stringify(profileData));
	
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
	
			setProfileData(content.contact);
			return setUserState({ user: content });
		} catch (err) {
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) toast.error(content);
		};
	};

	if (user.role === 0) return <Navigate to='/profile/settings' replace />;

	return (
		<>
			<header className='flex flex-col px-7 py-4 w-full rounded-t bg-link-water-200 dark:bg-bunker-900/30 gap-6'>
				<h1 className="text-3xl font-bold">Contacto</h1>
				<p className='dark:text-bunker-400 opacity-80'>Contacto y enlaces a redes sociales disponibles públicamente</p>
			</header>

			<Form onSubmit={ onSubmit } className='group flex flex-col items-start justify-start p-8 w-full rounded-b bg-link-water-50 dark:bg-bunker-900/50 gap-16' data-valid={ formValid }>

				<Fieldset classNames={{ content: 'mt-auto !gap-6' }}>
					
					<Fieldset.Field className='gap-2'>
		
						<Fieldset.Field.Label
							htmlFor='phone'
							className='font-medium'
						>
							WhatsApp
						</Fieldset.Field.Label>
		
						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>
	
							<PhoneInput
								defaultCountry={ profileData.phone.iso2 }
								value={ profileData.phone.number }
								name='phone'
								placeholder="P. ej. 04241234567"
								className={ `group/input w-full ${ loading ? 'disabled' : '' }` }
								countrySelectorStyleProps={{
									buttonClassName: 'px-2 h-full !bg-link-water-100 dark:!bg-bunker-900/30 !border-link-water-200 dark:!border-bunker-800 transition-colors duration-100 group-[.disabled]/input:cursor-not-allowed',
									buttonContentWrapperClassName: 'gap-1',
									dropdownArrowClassName: String.raw`!border-t-bunker-600 dark:!border-t-bunker-500 rotate-0 transition-transform duration-100 [&.react-international-phone-country-selector-button\_\_dropdown-arrow--active]:rotate-180`,
									dropdownStyleProps: {
										className: '!border-none rounded !outline-none !bg-mercury-50 dark:!bg-bunker-900 [&::-webkit-scrollbar-thumb]:dark:bg-bunker-500 [&::-webkit-scrollbar-thumb:active]:dark:bg-bunker-400 [&::-webkit-scrollbar-track]:dark:bg-bunker-900 [&::-webkit-scrollbar-corner]:dark:bg-bunker-900',
										listItemClassName: String.raw`group/item px-3 py-1 hover:!bg-link-water-100 dark:hover:!bg-bunker-600 [&.react-international-phone-country-selector-dropdown\_\_list-item--focused]:!bg-link-water-100 dark:[&.react-international-phone-country-selector-dropdown\_\_list-item--focused]:!bg-bunker-600 [&.react-international-phone-country-selector-dropdown\_\_list-item--selected]:!bg-link-water-100 dark:[&.react-international-phone-country-selector-dropdown\_\_list-item--selected]:!bg-bunker-600`,
										listItemCountryNameClassName: 'text-primary dark:text-mercury-100',
										listItemDialCodeClassName: String.raw`text-bunker-600 dark:text-bunker-500 group-[.react-international-phone-country-selector-dropdown\_\_list-item--focused]/item:text-bunker-600 dark:group-[&.react-international-phone-country-selector-dropdown\_\_list-item--focused]/item:text-bunker-400 group-[.react-international-phone-country-selector-dropdown\_\_list-item--selected]/item:text-bunker-600 dark:group-[.react-international-phone-country-selector-dropdown\_\_list-item--selected]/item:text-bunker-400 dark:group-hover/item:text-bunker-400`
									}
								}}
								dialCodePreviewStyleProps={{
									className: 'font-semibold text-bunker-600 dark:text-bunker-500 bg-link-water-100 dark:bg-bunker-900/30 border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-[.disabled]/input:opacity-80 group-[.disabled]/input:cursor-not-allowed'
								}}
								inputProps={{
									id: 'phone'
								}}
								inputClassName={ `!px-4 !py-[.63rem] flex-1 !h-full !rounded-r !text-base font-semibold !text-primary dark:!text-mercury-100 !bg-link-water-100 dark:!bg-bunker-900/30 !border-link-water-200 dark:!border-bunker-800 transition-colors duration-100 select-none focus:!border-link-water-400 dark:focus:!border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:!text-bunker-700 [&:not(:placeholder-shown)]:!bg-transparent ${ !phoneValid ? '!border-red-500 focus:!border-red-500 dark:!border-red-500 dark:focus:!border-red-500' : '' }` }
								onChange={ onPhoneChange }
								disabled={ loading }
								disableDialCodePrefill
								disableDialCodeAndPrefix
								showDisabledDialCodeAndPrefix
							/>

							{
								!phoneValid ?
									<div className='flex items-center justify-start h-full text-red-500 gap-2'>

										<ExclamationCircle className='!w-6' />

										<p className='text-xs'>El número de teléfono es inválido</p>

									</div>
								:
									null
							}
		
						</Fieldset.Field.Container>
								
					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>
		
						<Fieldset.Field.Label
							htmlFor='instagram'
							className='font-medium'
						>
							Instagram
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>
	
							<Fieldset.Field.Container.Input
								type='text'
								name='instagram'
								id='instagram'
								placeholder='Nombre de usuario'
								autoComplete='off'
								value={ profileData.instagram }
								onChange={ onChange }
								disabled={ loading }
								className={ `!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-valid:group-data-[valid=true]:focus:border-link-water-400 group-valid:group-data-[valid=true]:dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800 ${ !igValid ? '!border-red-500' : '' }` }
								minLength={ 4 }
								maxLength={ 116 }
							/>

							{
								!igValid ?
									<div className='flex items-center justify-start text-red-500 gap-2'>

										<ExclamationCircle className='!min-w-6' />

										<p className='text-xs'>
											{
												profileData.instagram.length && profileData.instagram.length < 4 ?
													'El enlace o nombre debe tener mínimo 4 caracteres'
												:
													profileData.instagram.length > 116 ?
														'El enlace o nombre excede el límite de 116 caracteres'
													:
														isIgUrl(profileData.instagram) && !isIgUrlValid(profileData.instagram) ?
															'Enlace inválido'
														:
															profileData.instagram[0] === '.' || profileData.instagram[ profileData.instagram.length - 1 ] === '.' ?
																'El nombre de usuario no puede empezar ni terminar con un "."'
															:
																!isNaN(Number(profileData.instagram)) ?
																	'El nombre de usuario no puede tener solo números'
																:
																	'El nombre contiene caracteres inválidos'
											}
										</p>

									</div>
								:
									null
							}

						</Fieldset.Field.Container>

					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='tiktok'
							className='font-medium'
						>
							TikTok
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>

							<Fieldset.Field.Container.Input
								type='text'
								name='tiktok'
								id='tiktok'
								placeholder='Nombre de usuario'
								autoComplete='off'
								value={ profileData.tiktok }
								onChange={ onChange }
								disabled={ loading }
								className={ `!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-valid:group-data-[valid=true]:focus:border-link-water-400 group-valid:group-data-[valid=true]:dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800 ${ !ttkValid ? '!border-red-500' : '' }` }
								minLength={ 4 }
								maxLength={ 116 }
							/>

							{
								!ttkValid ?
									<div className='flex items-center justify-start text-red-500 gap-2'>

										<ExclamationCircle className='!min-w-6' />

										<p className='text-xs'>
											{
												profileData.tiktok.length && profileData.tiktok.length < 4 ?
													'El enlace o nombre debe tener mínimo 4 caracteres'
												:
													profileData.tiktok.length > 116 ?
														'El enlace o nombre excede el límite de 116 caracteres'
													:
														isTTkUrl(profileData.tiktok) && !isTTkUrlValid(profileData.tiktok) ?
															'Enlace inválido'
														:
															profileData.tiktok[ profileData.tiktok.length - 1 ] === '.' ?
																'El nombre de usuario no puede terminar con un "."'
															:
																!isNaN(Number(profileData.tiktok)) ?
																	'El nombre de usuario no puede tener solo números'
																:
																	'El nombre contiene caracteres inválidos'
											}
										</p>

									</div>
								:
									null
							}

						</Fieldset.Field.Container>

					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='facebook'
							className='font-medium'
						>
							Facebook
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>

							<Fieldset.Field.Container.Input
								type='text'
								name='facebook'
								id='facebook'
								placeholder='https://www.facebook.com/pagina'
								autoComplete='off'
								value={ profileData.facebook }
								onChange={ onChange }
								disabled={ loading }
								className={ `!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-valid:group-data-[valid=true]:focus:border-link-water-400 group-valid:group-data-[valid=true]:dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800 ${ !fbValid ? '!border-red-500' : '' }` }
								minLength={ 5 }
								maxLength={ 116 }
							/>

							{
								!fbValid ?
									<div className='flex items-center justify-start text-red-500 gap-2'>

										<ExclamationCircle className='!min-w-6' />

										<p className='text-xs'>
											{
												profileData.facebook.length && profileData.facebook.length < 5 ?
													'El enlace o nombre debe tener mínimo 5 caracteres'
												:
													profileData.facebook.length > 116 ?
														'El enlace o nombre excede el límite de 116 caracteres'
													:
														isFbUrl(profileData.facebook) && !isFbUrlValid(profileData.facebook) ?
															'Enlace inválido'
														:
															'El nombre contiene caracteres inválidos'
											}
										</p>

									</div>
								:
									null
							}

						</Fieldset.Field.Container>

					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='twitter'
							className='font-medium'
						>
							Twitter
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>

							<Fieldset.Field.Container.Input
								type='text'
								name='twitter'
								id='twitter'
								placeholder='Nombre de usuario sin el @'
								autoComplete='off'
								value={ profileData.twitter }
								onChange={ onChange }
								disabled={ loading }
								className={ `!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-valid:group-data-[valid=true]:focus:border-link-water-400 group-valid:group-data-[valid=true]:dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800 ${ !ttValid ? '!border-red-500' : '' }` }
								minLength={ 5 }
								maxLength={ 116 }
							/>

							{
								!ttValid ?
									<div className='flex items-center justify-start text-red-500 gap-2'>

										<ExclamationCircle className='!min-w-6' />

										<p className='text-xs'>
											{
												profileData.twitter.length && profileData.twitter.length < 5 ?
													'El enlace o nombre debe tener mínimo 5 caracteres'
												:
													profileData.twitter.length > 116 ?
														'El enlace o nombre excede el límite de 116 caracteres'
													:
														isTtUrl(profileData.twitter) && !isTtUrlValid(profileData.twitter) ?
															'Enlace inválido'
														:
															!isNaN(Number(profileData.twitter)) ?
																'El nombre de usuario no puede tener solo números'
															:
																'El nombre contiene caracteres inválidos'
											}
										</p>

									</div>
								:
									null
							}

						</Fieldset.Field.Container>

					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='email'
							className='font-medium'
						>
							Correo electrónico
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start lg:max-w-[60%] gap-3'>

							<Fieldset.Field.Container.Input
								type='email'
								name='email'
								id='email'
								placeholder='contacto@artista.com'
								autoComplete='email'
								value={ profileData.email }
								onChange={ onChange }
								disabled={ loading }
								className={ `peer !px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none group-valid:group-data-[valid=true]:focus:border-link-water-400 group-valid:group-data-[valid=true]:dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800 invalid:!border-red-500` }
							/>

							<div className='hidden peer-invalid:flex items-center justify-start text-red-500 gap-2'>

								<ExclamationCircle className='!min-w-6' />

								<p className='text-xs'>Correo electrónico inválido</p>

							</div>

						</Fieldset.Field.Container>

					</Fieldset.Field>

				</Fieldset>

				<Form.Footer className='flex flex-col w-full'>

					<Form.Footer.Buttons>

						<button
							type='submit'
							className={ `flex items-center justify-center px-4 py-2 w-fit outline-none border border-link-water-300 dark:border-bunker-800 rounded bg-link-water-50 dark:bg-bunker-950 group-valid:group-data-[valid=true]:hover:bg-link-water-300 group-valid:group-data-[valid=true]:hover:dark:bg-bunker-950/40 group-valid:group-data-[valid=true]:hover:border-link-water-400 group-valid:group-data-[valid=true]:hover:dark:border-bunker-700 transition-[filter,color,border-color,background-color] duration-100 group-invalid:cursor-not-allowed group-data-[valid=false]:cursor-not-allowed group-invalid:bg-gray-400 group-data-[valid=false]:bg-gray-400 group-invalid:dark:bg-bunker-900 group-data-[valid=false]:dark:bg-bunker-900 group-invalid:opacity-50 group-data-[valid=false]:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:dark:!bg-bunker-950 hover:!border-link-water-300 hover:dark:!border-bunker-800' : '' }` }
						>

							<span className='flex items-center relative text-sm text-primary dark:text-mercury-100 font-semibold gap-2'>

								{ 
									loading ?
										<Loading size="16" stroke="2" color="var(--purple)" />
									:
										<FloppyDisk className='w-4 text-accent-500' />
								}

								Guardar

							</span>

						</button>

					</Form.Footer.Buttons>

				</Form.Footer>

			</Form>
		</>
	);
}

const AccountTab = ({ state }) => {
	const { userAPI: { user: [ { user }, setUserState ], updateEmail } } = state;
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
			<header className='flex flex-col px-7 py-4 w-full rounded-t bg-link-water-200 dark:bg-bunker-900/30 gap-6'>
				<h1 className="text-3xl font-bold">Cuenta</h1>
				<p className='dark:text-bunker-400 opacity-80'>Configuraciones</p>
			</header>

			<Form onSubmit={ onSubmit } className='group flex flex-col lg:flex-row items-start justify-start p-8 w-full rounded-b bg-link-water-50 dark:bg-bunker-900/50 gap-6'>

				<div>
					<h3 className="text-lg font-medium">Correo de Acceso</h3>
					<p className="text-sm opacity-90">El correo que usas para acceder a ArtGallery</p>
				</div>

				<div className='flex flex-col w-full gap-6'>

					<Fieldset classNames={{ content: 'mt-auto !gap-6' }}>
						
						<Fieldset.Field className='gap-2'>
			
							<Fieldset.Field.Label
								htmlFor='email'
								className='font-medium after:content-["_*"] after:text-accent-500'
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
									className='!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
								/>
			
							</Fieldset.Field.Container>
									
						</Fieldset.Field>
						
						{
							email !== profileData.email ?
								<Fieldset.Field className='gap-2'>
				
									<Fieldset.Field.Label
										htmlFor='password'
										className='font-medium after:content-["_*"] after:text-accent-500'
									>
										Por favor ingresa tu contraseña para cambiar el correo electrónico
									</Fieldset.Field.Label>
	
									<Fieldset.Field.Container onEvents={{ onBlur }} className='flex flex-col !items-start gap-1'>
	
										<Fieldset.Field.Container.Input
											className={ `peer ${ profileData.password.length ? 'filled' : '' } !px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800` }
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
											className='input__showPassword flex items-center justify-center absolute right-0 w-14 h-full text-primary dark:text-bunker-800 opacity-0 pointer-events-none transition-opacity duration-100 select-none peer-focus:opacity-100 peer-[.filled]:opacity-100 peer-focus:pointer-events-auto peer-[.filled]:pointer-events-auto peer-focus:cursor-pointer peer-[.filled]:cursor-pointer'
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
										className={ `flex items-center justify-center px-4 py-2 w-fit border border-link-water-300 dark:border-bunker-800 rounded bg-link-water-50 dark:bg-bunker-950 group-valid:hover:bg-link-water-300 group-valid:hover:dark:bg-bunker-950/40 group-valid:hover:border-link-water-400 group-valid:hover:dark:border-bunker-700 transition-[filter,color,border-color,background-color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:dark:bg-bunker-900 group-invalid:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:dark:!bg-bunker-950 hover:!border-link-water-300 hover:dark:!border-bunker-800' : '' }` }
									>
	
										<span className='flex items-center relative text-sm text-primary dark:text-mercury-100 font-semibold gap-2'>
	
											{ 
												loading ?
													<Loading size="16" stroke="2" color="var(--purple)" />
												:
													<FloppyDisk className='w-4 text-accent-500' />
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
		content: ProfileTab,
		roles: [ 1 ]
	},
	{
		label: "contact",
		title: "Contacto",
		Icon: Share,
		content: ContactTab,
		roles: [ 1 ]
	},
	{
		divider: true
	},
	{
		label: "settings",
		title: "Cuenta",
		Icon: Settings,
		content: AccountTab,
		roles: [ 0, 1 ]
	}
];

export const ProfileEdit = () => {
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const params = useParams();
	const { userAPI: { user: [ { user } ] }, loading: [ loadingState ], useTheme } = state;
	const { isDark } = useTheme;
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
			<Loading size="150" color={ isDark ? 'var(--purple)' : 'var(--color-primary)' } stroke="5" />
		</main>
	);

	const { names, lastnames, username, photo, createdAt, role } = user;

	const createdDate = DateTime.fromISO(createdAt).setLocale('es-VE');
	const month = createdDate.toLocaleString({ month: 'long' });

	const CurrentTab = PROFILE_OPTIONS.find(({ label }) => label === setting).content;

	return (
		<main className='flex flex-col items-center lg:flex-row lg:items-start justify-start w-full h-full gap-8'>

			<section className='flex flex-col items-center justify-start w-full lg:w-auto h-full gap-8 lg:gap-4'>

				<header className='flex flex-col items-center lg:flex-row justify-start flex-[1_1_0] gap-2'>
	
					{
						role === 1 ?
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
						:
							<figure>
								<MissingPhoto className='w-24 rounded-full' />
							</figure>
					}
	
					<div className='flex flex-col items-center lg:items-start justify-center h-full gap-1'>
							
						<span className="text-xs font-medium uppercase text-bunker-500">Configuración</span>
	
						{
							role === 1 ?
								<Link
									to={ `/artists/${ username }` }
									aria-label={ `${ names.split(' ')[0] } ${ lastnames.split(' ')[0] }` }
									className='text-2xl font-bold'
								>
									<h2>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
								</Link>
							:
							<h2 className='text-2xl font-bold'>{ names.split(' ')[0] } { lastnames.split(' ')[0] }</h2>
						}
	
						<time className='text-xs text-bunker-500'>
							{
								role === 1 ?
									<>Miembro desde { `${ month[0].toUpperCase() }${ month.slice(1) }` } { createdDate.year }</>
								:
									<>Administrador</>
							}
						</time>
	
					</div>
	
				</header>
	
				<ul className='flex lg:flex-col w-full h-full bg-link-water-100 dark:bg-bunker-900/50 lg:bg-transparent lg:dark:bg-transparent lg:gap-2'>
					{
						PROFILE_OPTIONS.filter(({ roles, divider }) => roles?.includes(user.role) || divider).map(({ label, title, Icon, divider }, ind, array) =>
							!divider ?
								<li key={ label }>
									<button
										onClick={ () => navigate(`/profile/${ label }`) }
										className={ `group flex items-center justify-start relative px-5 py-3 w-full lg:rounded-sm overflow-hidden gap-2 hover:bg-link-water-100 dark:hover:bg-bunker-900/50 ${ label === setting ? 'lg:bg-link-water-100 lg:dark:bg-bunker-900/50 pointer-events-none after:absolute after:top-0 after:left-0 after:w-full after:h-[3px] lg:after:w-[3px] lg:after:h-full after:bg-accent-500' : '' }` }
									>
										<Icon className={ `w-5 text-primary dark:text-bunker-300 transition-colors duration-100 group-hover:text-accent-500 ${ label === setting ? '!text-accent-500' : '' }` } />
										<span className={ `font-medium opacity-70 transition-opacity duration-100 group-hover:opacity-100 ${ label === setting ? '!opacity-100' : '' }` }>{ title }</span>
									</button>
								</li>
							:
								ind !== array.length - 1 && ind !== 0 ?
									<div key={ `ind-${ ind }` } className='mx-1 my-3 lg:m-5 w-[2px] h-auto lg:h-px lg:w-auto bg-link-water-200 dark:bg-bunker-900/50'></div>
								:
									null
						)
					}
				</ul>

			</section>

			<section className='flex flex-col flex-1 items-start justify-start w-full h-full'>
				<CurrentTab state={ state } />
			</section>

		</main>
	);
};