import { Link, type LinkProps } from 'react-router';
import { buttonClassName, type ButtonStyleProps } from './buttonStyles';

type LinkButtonProps = LinkProps & ButtonStyleProps & { disabled?: boolean };
export default function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  disabled,
  children,
  ...props
}: LinkButtonProps) {
  const styles = buttonClassName({ variant, size, fullWidth, className });
  if (disabled)
    return (
      <span aria-disabled="true" className={`${styles} opacity-50 cursor-not-allowed`}>
        {children}
      </span>
    );
  return (
    <Link {...props} className={styles}>
      {children}
    </Link>
  );
}
