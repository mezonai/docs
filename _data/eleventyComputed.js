module.exports = {
  permalink: data => {
    // Kiểm tra file markdown nằm trong thư mục "docs/"
    if (data.page && data.page.inputPath && data.page.inputPath.startsWith('./docs/')) {
      const slug = data.page.fileSlug; // Lấy tên file không phần mở rộng
      return `/${slug}/`; // Output thành _site/slug/index.html
    }

    // Trả về permalink gốc nếu có
    return data.permalink;
  }
};
