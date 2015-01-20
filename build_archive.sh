#!/bin/bash
BUILD_FOLDER=$1
RANDOM_FOLDER=$2
ARCHIVE_LOCATION=$3

DOWNLOAD_LOCATION=$BUILD_FOLDER/$RANDOM_FOLDER
echo $DOWNLOAD_LOCATION
mkdir $DOWNLOAD_LOCATION
cd $DOWNLOAD_LOCATION

wget --no-check-certificate $ARCHIVE_LOCATION
ARCHIVE_NAME=`ls`
unzip $ARCHIVE_NAME

UNZIPPED_FOLDER=`ls -d */`
cd $UNZIPPED_FOLDER

time make