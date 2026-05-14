export default function Loading() {
  return (
    <div className="container-shell py-12">
      <div className="grid gap-4">
        <div className="skeleton h-40 rounded-[36px]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-72 rounded-[30px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
