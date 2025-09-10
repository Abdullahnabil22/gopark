import DataLoading from "./DataLoading";

export default function Loading({
  className = "",
  ...props
}: {
  className?: string;
  itemCount?: number;
}) {
  return <DataLoading itemCount={props.itemCount} className={className} />;
}
