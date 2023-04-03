import Icon from "/src/assets/icon.png";

export default () => {
  return (
    <div
      class="gap-8 grid"
      style={{
        "grid-auto-flow": "column",
        "grid-template-columns": "min-content auto min-content",
      }}
    >
      <a href="/" class="w-16 h-16 min-w-max">
        <img src={Icon} class="w-16 h-16" />
      </a>
    </div>
  );
};
