interface Props {
  label: string;
  children: React.ReactNode;
}

export default function FormField({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  );
}
