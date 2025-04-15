const RegularButton = ({
  children,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-fit transform rounded-lg px-6 py-3 font-semibold shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
        disabled
          ? "cursor-not-allowed bg-gray-300 text-gray-500"
          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105 hover:brightness-110 focus:ring-blue-300 active:scale-100"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default RegularButton;
