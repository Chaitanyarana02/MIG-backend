function paginate(data, totalItems, currentPage, perPage, basePath) {
    const totalPages = Math.ceil(totalItems / (perPage || 15)); // Default perPage to 15 if not provided or 0

    const responseData = {
        current_page: currentPage.toString(),
        total: totalItems.toString(),
        data: perPage === 1 ? data[0] : data,
        first_page_url: `${basePath}?page=1`,
        from: perPage === 1 ? '1' : ((currentPage - 1) * (perPage || 15) + 1).toString(),
        last_page: totalPages.toString(),
        last_page_url: `${basePath}?page=${totalPages}`,
        next_page_url: currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : '',
        path: basePath,
        per_page: (perPage || 15).toString(),
        prev_page_url: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : '',
        to: perPage === 1 ? '1' : Math.min(currentPage * (perPage || 15), totalItems).toString(),
        status: true,
        status_code: '200',
        message: 'Record(s) has been listed successfully.'
    };

    return responseData;
}

module.exports = {
    paginate
};
