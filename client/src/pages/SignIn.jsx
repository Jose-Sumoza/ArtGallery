import { useRef, useState, useReducer, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GlobalState } from '@/GlobalState';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import { View, ViewOff } from '@icons';

const INITIAL_DATA = {
	email: '',
	password: ''
};

const reducer = (current, update) => ({...current, ...update});

export const SignIn = () => {
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const { setLogged } = state;
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

	const handleSubmit = async e => {
		if (loading) return e.preventDefault();
		
		setLoading(true);
		e.preventDefault();

		try {
			const { data } = await axios.post('/user/login', { ...authData });
			const { success, content } = data;

			if (!success) {
				setLoading(false);
				toast.error(content);
			};

			if (success) {
				localStorage.setItem('firstLogin', true);

				setLogged(true);
				navigate('/', { replace: true });
				return toast.success("Sesión iniciada exitosamente.");
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

			<Form onSubmit={ handleSubmit } className='group flex flex-col items-center lg:items-start w-full gap-8'>

				<Fieldset
					title="Descubre arte que te encantará"
					classNames={{
						title: 'text-center',
						content: 'mt-12 lg:mt-20 !w-2/3 lg:!w-2/5 !gap-6'
					}}
				>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='email'
							className='font-medium'
						>
							Correo electrónico
						</Fieldset.Field.Label>

						<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

							<Fieldset.Field.Container.Input
								placeholder='correo@ejemplo.com'
								type='email'
								inputMode='email'
								name="email"
								id="email"
								value={ authData.email }
								onChange={ onChange }
								required
								disabled={ loading }
								className='!px-4 !py-2 bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed'
							/>

						</Fieldset.Field.Container>

					</Fieldset.Field>

					<Fieldset.Field className='gap-2'>

						<Fieldset.Field.Label
							htmlFor='password'
							className='font-medium'
						>
							Contraseña
						</Fieldset.Field.Label>

						<Fieldset.Field.Container onEvents={{ onBlur }} className='flex flex-col !items-start gap-1'>

							<Fieldset.Field.Container.Input
								className={ `peer ${ authData.password?.length ? 'filled' : '' } !px-4 !py-2 bg-link-water-100 border border-link-water-200 transition-colors duration-100 select-none focus:border-link-water-400 disabled:opacity-80 disabled:cursor-not-allowed` }
								placeholder='contraseña'
								type={ showPass ? 'text' : 'password' }
								name="password"
								id="password"
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

				</Fieldset>

				<Form.Footer className='flex flex-col w-2/3 lg:w-2/5'>

					<Form.Footer.Buttons>

						<button
							type='submit'
							className={ `flex items-center justify-center py-2 w-full rounded-lg bg-accent group-valid:hover:brightness-110 transition-[filter_color] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-gray-400 group-invalid:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:!brightness-100' : '' }` }
						>

							<span className='flex items-center relative text-link-water-50 [&_l-ring]:absolute [&_l-ring]:right-[120%]'>
								{ loading ? <Loading size="16" stroke="1.5" color="var(--bg-color)" /> : null }
								Iniciar sesión
							</span>

						</button>

					</Form.Footer.Buttons>

					<Form.Footer.Message className='mt-4 text-sm'>
						¿No tienes una cuenta? <Link to='../register' className='!text-accent hover:underline'>¡Crea una!</Link>
					</Form.Footer.Message>

				</Form.Footer>

			</Form>

		</main>
	);
};