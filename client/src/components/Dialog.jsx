import React from 'react';
import Loading from './Loading';

const Dialog = ({ className = '', children }) => {
	return (
		<section className={ `flex flex-col justify-between min-w-96 rounded-lg bg-white overflow-hidden ${ className }` }>
			{ children }
		</section>
	);
};

const Title = ({ className = '', children }) => {
	return (
		<header className='p-4 w-full bg-link-water-100/50'>
			<h3 className={ `font-bold text-lg text-primary ${ className }` }>
				{ children }
			</h3>
		</header>
	);
};

const Description = ({ className = '', children }) => {
	return (
		<p className={ `m-4 text-sm text-primary ${ className }` }>
			{ children }
		</p>
	);
};

const Buttons = ({ className = '', children }) => {
	return (
		<div className={ `flex justify-end p-4 w-full border-t border-link-water-100 gap-3 ${ className }` }>
			{ children }
		</div>
	);
};

const Cancel = ({
	className = '',
	danger,
	isDisabled,
	children,
	...props
}) => {
	return (
		<button
			className={ `flex items-center justify-center px-4 py-2 rounded ${ danger ? 'text-red-500' : 'text-secondary' } bg-transparent gap-2 group-data-[invalid=false]:group-valid:hover:brightness-110 transition-[filter_color_border-color] duration-100 group-invalid:cursor-not-allowed group-invalid:opacity-50 group-data-[invalid=true]:cursor-not-allowed group-data-[invalid=true]:opacity-50 ${ isDisabled ? 'cursor-not-allowed opacity-50' : '' } ${ className }` }
			disabled={ isDisabled }
			{ ...props }
		>
			{ children }
		</button>
	);
};

const Accept = ({
	classNames = {
		base: '',
		loading: {
			size: '16',
			stroke: '1.5',
			color: 'var(--bg-color)'
		}
	},
	danger,
	icon = null,
	isLoading,
	children,
	...props
}) => {
	const { base = '', loading } = classNames;
	
	return (
		<button 
			className={ `flex items-center justify-center px-4 py-2 border border-transparent rounded ${ danger ? 'bg-red-500' : '!bg-accent' } gap-2 group-data-[invalid=false]:group-valid:hover:brightness-110 transition-[filter_color_border-color] duration-100 group-invalid:cursor-not-allowed group-invalid:border-gray-400 group-invalid:bg-gray-400 group-invalid:opacity-50 group-data-[invalid=true]:cursor-not-allowed group-data-[invalid=true]:border-gray-400 group-data-[invalid=true]:bg-gray-400 group-data-[invalid=true]:opacity-50 ${ isLoading ? `cursor-not-allowed opacity-80 ${ danger ? 'hover:bg-red-500' : 'hover:!bg-accent' } hover:!border-transparent` : '' } ${ base }` }
			disabled={ isLoading }
			{ ...props }
		>

			{
				isLoading ?
					<Loading
						size={ loading?.size || '16' }
						stroke={ loading?.stroke || '1.5' }
						color={ loading?.color || 'var(--bg-color)' }
					/>
				:
					icon
			}

			<span>{ children }</span>

		</button>
	);
};

Dialog.Title = Title;
Dialog.Description = Description;
Buttons.Cancel = Cancel;
Buttons.Accept = Accept;
Dialog.Buttons = Buttons;

export default Dialog;