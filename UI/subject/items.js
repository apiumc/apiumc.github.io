WDK.page('subject/items', '内容管理', function (root) {
    root.find('.pagination-container').paging("Subject", "Search", root.find('table tbody')).on('sort', root.find('.el-sort'));
    root.find('table').thead();
}, false);