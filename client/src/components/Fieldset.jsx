import { forwardRef } from 'react';

const Fieldset = ({
	title,
	subtitle,
	classNames = {
		base: '',
		content: '',
		title: '',
		subtitle: ''
	},
	children
}) => {
	return (
		<div
			className={ `flex flex-col items-center lg:items-start justify-between w-full ${ classNames.base }` }
			role='group'
			aria-labelledby={ title }
		>
			{ title ? <h2 id={ title } className={ `text-3xl font-semibold ${ classNames.title }` }>{ title }</h2> : null }
			{ subtitle ? <h3 className={ `mt-2 text-xl font ${ classNames.subtitle }` }>{ subtitle }</h3> : null }

			<div className={ `flex flex-col mt-20 w-full gap-3 [&>div]:flex [&>div]:flex-col ${ classNames.content }` }>
				{ children }
			</div>
		</div>
	);
};

const Field = ({ className, children }) => {
	return (
		<div className={`flex flex-col items-start relative w-full [&_svg]:w-5 ${ className ?? '' }`}>
			{ children }
		</div>
	);
};

const Description = ({ className, children, ...props }) => {
	return (
		<p className={ `text-[13px] text-secondary ${ className || '' }` } { ...props }>
			{ children }
		</p>
	);
};

const Container = ({ label, htmlFor, onEvents, hasDecorator, className, children, ...props }) => {
	return (
		<div className={ `flex items-center relative w-full h-full ${ className ?? '' }` } { ...onEvents } { ...props }>
			{ children }
			{
				label ?
					<>
						<span className={`field__label uppercase ${ !hasDecorator ? '!left-[25px]' : '' }`}>{ label }</span>
						<label className={`field__placeholder uppercase ${ !hasDecorator ? '!left-[35px]' : '' }`} htmlFor={ htmlFor }>{ label }</label>
					</>
				:
					null
			}
		</div>
	);
};

const Label = ({ htmlFor, children, ...props }) => {
	return (
		<label htmlFor={ htmlFor } { ...props }>{ children }</label>
	);
};

const Input = forwardRef(({ className, ...props }, ref) => {
	return (
		<input
			className={ `flex items-center justify-start px-6 py-3 w-full outline-none border border-link-water-200 rounded-lg font-semibold text-primary transition-colors duration-100 overflow-hidden [&:not(:placeholder-shown)]:bg-transparent ${ className ?? '' }` } 
			{ ...props }
			ref={ ref }
		/>
	)
});

const TextArea = forwardRef(({ className, ...props }, ref) => {
	return (
		<textarea
			className={ `px-6 py-3 w-full outline-none border border-link-water-200 rounded-lg font-semibold text-primary transition-colors duration-100 [&:not(:placeholder-shown)]:bg-transparent  ${ className || '' }` }
			{ ...props }
			ref={ ref }
		>
		</textarea>
	)
});

Field.Label = Label;
Field.Description = Description;
Container.Input = Input;
Container.TextArea = TextArea
Field.Container = Container;
Fieldset.Field = Field;

export default Fieldset;