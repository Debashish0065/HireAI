
function PageContainer({
    children,
    maxWidth = "1200px"
}) {

    return (
        <main
            style={{
                width: "100%",
                maxWidth: maxWidth,
                margin: "0 auto",
                padding: "32px 24px",
                boxSizing: "border-box"
            }}
        >
            {children}
        </main>
    );
}

export default PageContainer;
