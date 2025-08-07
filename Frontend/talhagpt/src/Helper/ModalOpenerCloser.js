let open_modal = (id) => {
    const modal = document.getElementById(id);
    if (modal && typeof modal.showModal === "function") {
        modal.showModal();
    } else {
        console.warn(`Modal with ID '${id}' not found or not a <dialog> element.`);
    }
};

let close_modal = (id) => {
    const modal = document.getElementById(id);
    if (modal && typeof modal.close === "function") {
        modal.close();
    } else {
        console.warn(`Modal with ID '${id}' not found or not a <dialog> element.`);
    }
};

export default {
    open_modal,
    close_modal,
};
