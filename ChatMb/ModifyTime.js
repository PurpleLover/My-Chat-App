export const convertDateTimeToString = (date) => { 
  if (date !== null && date !== '') {
    let temp = new Date(date);
    return _readableFormat(temp.getDate()) + '/' + _readableFormat(temp.getMonth() + 1) + '/' + _readableFormat(temp.getFullYear()) + ' ' + _readableFormat(temp.getHours()) + ':' + _readableFormat(temp.getMinutes()) + ':' + _readableFormat(temp.getSeconds());
  }
  return 'N/A';
}

const _readableFormat = (value) => {
  return (value < 10) ? ('0' + value) : value;
}