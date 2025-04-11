const RegularButton = ({
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`w-fit transform rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 active:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default RegularButton;
