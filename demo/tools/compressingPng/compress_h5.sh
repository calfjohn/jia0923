PNG_PATH=pngquant_macos
export PATH=$PATH:$PNG_PATH
chmod a+x $PNG_PATH/png*
function forfiles() {
        for file in `find $1 -name $2`
        do
                if [ -d $1"/"$file ]
                then
                        forfiles $1"/"$file
                else
                        echo "compress $file"
                        pngquant -f --nofs --ext .png "$file"
                fi
        done
}

INIT_PATH="../../build/web-mobile"
FILE_TYPE="*.png"
forfiles $INIT_PATH $FILE_TYPE
