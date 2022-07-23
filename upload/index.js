/**
 * @Description: 业务组件-上传
 * @Author: LH
 * @Date: 2022-07-23 10:22:00
 * @LastEditors: LH
 * @LastEditTime: 2022-07-23 10:22:00
 * @example: 示例
 * <rm-upload accept=".jpg,.png,.jpeg" ref="uploadImproveImage" :multiple="true"
   :limit="5" list-type="picture-card" :file-list="fileList">
  </rm-upload>
 */

define([
    'text!' + ELMP.resource('upload/index.html', 'zh_common'),
], function (tmpl) {
    return {
        name: 'rm-upload',
        template: tmpl,
        props: {
            accept: {
                type: String,
                default: '*'
            },
            listType: {
                type: String,
                default: 'text'
            },
            multiple: {
                type: Boolean,
                default: false
            },
            limit: {
                type: Number,
                default: 1
            },
            fileList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isImage: {
                type: Boolean,
                default: true
            }
        },

        data: function () {
            return {
                prefixClass: 'rm-upload',
                fileData: '',  // 文件上传数据（多文件合一）
                delFileIds: [],     //要删除的数据组
            };
        },
        methods: {
            // 上传文件
            uploadFile(file) {
                this.fileData.append('files', file.file);  // append增加数据
            },

            // 上传到服务器
            async submitUpload(referenceId) {
                let id;
                this.fileList = _.filter(this.fileList, item => 'raw' in item);
                const isLt100M = this.fileList.every(file => file.size / 1024 / 1024 < 100);
                if (!isLt100M) {
                    this.$message.error('请检查，上传文件大小不能超过100MB!');
                } else {
                    this.fileData = new FormData();
                    this.$refs.upload.submit();  // 提交调用uploadFile函数
                    _.each(this.delFileIds, item => {
                        this.fileData.append('delFileIds', item);
                    });
                    this.fileData.append('referenceId', referenceId || '');
                    await this.$axios.post('/pdm/rm/library/upload/attach', this.fileData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }).then((response) => {
                        if (Number(response.code) === 200) {
                            id = response?.res?.data;
                            this.fileList = [];
                        } else {
                            this.$message({
                                message: response.message,
                                type: 'error'
                            })
                        }
                    });
                }
                return id;
            },

            //移除
            handleRemove(file, fileList) {
                if (!('raw' in file)) {
                    this.delFileIds.push(file.id);
                }
                this.fileList = fileList;
            },

            // 选取文件超过数量提示
            handleExceed(files, fileList) {
                this.$message.warning(`最多可上传${this.limit}张图片`);
            },

            //监控上传文件列表
            handleChange(file, fileList) {
                let existFile = fileList.slice(0, fileList.length - 1).find(f => f.name === file.name);
                if (existFile) {
                    this.$message.error('当前文件已经存在!');
                    fileList.pop();
                }
                this.fileList = fileList;
            },
        }
    };
});