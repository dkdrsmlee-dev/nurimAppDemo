interface ActionErrorProps {
  message: string;
}

export function ActionError({ message }: ActionErrorProps) {
  return <p className="action-error">{message}</p>;
}
