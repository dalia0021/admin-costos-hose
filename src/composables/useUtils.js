export const useUtils = () => {
    const getImgUrl = (image) => {
        const imageUrl = new URL(`/src/assets/${image}`, import.meta.url);
        return imageUrl;
    };

    const scrollToTop = () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);  
    };

    return {
        getImgUrl,
        scrollToTop
    };
};
