#!/bin/bash
BUILD_FOLDER=$1
RANDOM_FOLDER=$2

ARCHIVE_LOCATION=$3

DOWNLOAD_LOCATION=$BUILD_FOLDER/$RANDOM_FOLDER
echo " making folder: $DOWNLOAD_LOCATION"
mkdir $DOWNLOAD_LOCATION
cd $DOWNLOAD_LOCATION

echo "downloading and unzipping archive: $ARCHIVE_LOCATION"
wget --no-check-certificate $ARCHIVE_LOCATION > /dev/null 2>&1
ARCHIVE_NAME=`ls`
unzip $ARCHIVE_NAME > /dev/null 2>&1

UNZIPPED_FOLDER=`ls -d */`
cd $UNZIPPED_FOLDER

echo "starting building ..."
TIME=$( { time make > /dev/null; } 2>&1 )
echo "last build result: $?"
echo $TIME
echo "resulted .bit file: " `ls | grep ".bit$"`
echo "current working directory: " `pwd`