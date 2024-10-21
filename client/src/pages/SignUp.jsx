import { useRef, useState, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import { View, ViewOff } from '@icons';

const INITIAL_DATA = {
	names: '',
	lastnames: '',
	username: '',
	email: '',
	password: ''
};

const reducer = (current, update) => ({...current, ...update});

export const SignUp = () => {
	const navigate = useNavigate();
	const passwordRef = useRef(null);

	const [ loading, setLoading ] = useState(false);
	const [ showPass, setShowPass ] = useState(false);
	const [ authData, setAuthData ] = useReducer(reducer, INITIAL_DATA);

	const onChange = e => {
		const { name, value } = e.target;

		setAuthData({
			[ name ]: value
		});
	};

	const onSubmit = async e => {
	    if (loading) return e.preventDefault();
		
		e.preventDefault();

        setLoading(true);

		try {
			const { data } = await axios.post('/user/register', { ...authData });
			const { status, success, content } = data;

			if (status === 500) {
				setLoading(false);
				toast.error("Error en el servidor.");
			};
			
			if (!success) {
				setLoading(false);
				toast.error(content);
			};

			if (success) {
				navigate('/login', { replace: true });
				setLoading(false);
				return toast.success("¡Se ha registrado exitosamente!");
			};
		} catch (err) {
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) toast.error(content);
		};
	};

	const onBlur = e => {
		e.preventDefault();
		if (e.relatedTarget && e.relatedTarget.classList.contains("input__showPassword")) passwordRef.current.focus();
	};

	return (
		<main className='w-full'>

			<Form onSubmit={ onSubmit } className='group flex flex-col items-center w-full gap-8'>

				<Fieldset
					title="Crea una cuenta"
					classNames={{
						title: 'text-center',
						content: 'lg:!flex-row justify-between mt-12 lg:mt-20 !w-2/3 lg:!w-full !gap-6'
					}}
				>

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
									placeholder='P. ej. Pablo Antonio'
									type='text'
									name="names"
									id="names"
									value={ authData.names }
									onChange={ onChange }
									minLength={ 3 }
									maxLength={ 30 }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
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
									placeholder='P. ej. López García'
									type='text'
									name="lastnames"
									id="lastnames"
									value={ authData.lastnames }
									onChange={ onChange }
									minLength={ 3 }
									maxLength={ 20 }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
								/>

							</Fieldset.Field.Container>

						</Fieldset.Field>

						<Fieldset.Field className='gap-2'>

							<Fieldset.Field.Label
								htmlFor='username'
								className='font-medium after:content-["_*"] after:text-red-500'
							>
								Nombre de usuario
							</Fieldset.Field.Label>

							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

								<Fieldset.Field.Container.Input
									placeholder='P. ej. pablo_lópez43'
									type='text'
									name="username"
									id="username"
									value={ authData.username }
									onChange={ onChange }
									minLength={ 3 }
									maxLength={ 53 }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
								/>

							</Fieldset.Field.Container>

						</Fieldset.Field>

					</div>

					<div className='flex flex-col w-full gap-6'>
	
						<Fieldset.Field className='gap-2'>

							<Fieldset.Field.Label
								htmlFor='email'
								className='font-medium after:content-["_*"] after:text-red-500'
							>
								Correo electrónico
							</Fieldset.Field.Label>

							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

								<Fieldset.Field.Container.Input
									placeholder='P. ej. pablo@lópez.com'
									type='email'
									inputMode='email'
									name="email"
									id="email"
									value={ authData.email }
									onChange={ onChange }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
								/>

							</Fieldset.Field.Container>

						</Fieldset.Field>

						<Fieldset.Field className='gap-2'>
	
							<Fieldset.Field.Label
								htmlFor='password'
								className='font-medium after:content-["_*"] after:text-red-500'
							>
								Contraseña
							</Fieldset.Field.Label>
	
							<Fieldset.Field.Container onEvents={{ onBlur }} className='flex flex-col !items-start gap-1'>
	
								<Fieldset.Field.Container.Input
									className={ `peer ${ authData.password?.length ? 'filled' : '' } !px-4 !py-2 !rounded bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed` }
									type={ showPass ? 'text' : 'password' }
									name="password"
									id="password"
									placeholder=" "
									value={ authData.password }
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

					</div>

				</Fieldset>

				<Form.Footer className='flex flex-col w-2/3 lg:w-2/5'>

					<Form.Footer.Buttons>

						<button
							type='submit'
							className={ `flex items-center justify-center py-2 w-full rounded bg-accent group-valid:hover:brightness-110 transition-[filter_color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:!brightness-100' : '' }` }
						>

							<span className='flex items-center relative text-link-water-50 [&_l-ring]:absolute [&_l-ring]:right-[120%]'>
								{ loading ? <Loading size="16" stroke="1.5" color="var(--bg-color)" /> : null }
								Crear cuenta
							</span>

						</button>

					</Form.Footer.Buttons>

					<Form.Footer.Message className='mt-4 text-sm'>
						¿Tienes una cuenta? <Link to='../login' className='!text-accent hover:underline'>¡Inicia sesión!</Link>
					</Form.Footer.Message>

				</Form.Footer>

			</Form>

		</main>
	);
};