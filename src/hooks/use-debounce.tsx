import React from "react";

const useDebounce = ({ value }: { value: string }) => {
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
    }, 600);

    return () => clearTimeout(t);
  }, [value]);

  return { debounced };
};

export default useDebounce;
