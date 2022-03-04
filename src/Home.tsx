import NavBar from "./components/list/NavBar";

export default () => {
  return (
    <>
      <NavBar
        setChars={() => {
          window.location.reload();
        }}
      />
      // Temporary mesure
    </>
  );
};
