"use client"
import { CSSProperties, useState } from 'react';

// material-ui
import { useTheme, Theme } from '@mui/material/styles';
import { CardMedia, Link, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material';

// project imports
// import EditStory from '../Backlogs/EditStory';
// import AlertItemDelete from './AlertItemDelete';
import IconButton from '../@extended/IconButton';

// assets
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface Props {
  item: any;
  index: number;
  handleShowNextComponent: (_arg1: any, _arg2?: string, _arg3?: string) => void;
}

const backImage = '@/src/assets/images/profile/'

// item drag wrapper
const getDragWrapper = (
  theme: Theme,
  radius: string
): CSSProperties | undefined => {
  return {
    userSelect: 'none',
    margin: `0 0 ${8}px 0`,
    padding: 16,
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    borderRadius: radius,
  };
};

// ==============================|| KANBAN BOARD - ITEMS ||============================== //

const Items = ({ item, index, handleShowNextComponent }: Props) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<Element | ((element: Element) => Element) | null | undefined>(null);
  const [anchorElEdit, setAnchorElEdit] = useState<Element | ((element: Element) => Element) | null | undefined>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorElEdit(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseEdit = () => {
    setAnchorElEdit(null);
  };

  const [open, setOpen] = useState(false);
  const handleModalClose = (status: boolean) => {
    setOpen(false);
  };

  const [openStoryDrawer, setOpenStoryDrawer] = useState<boolean>(false);
  const handleStoryDrawerOpen = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  const editStory = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  const handleClickItem = (item: any) => {
    if (item.nextToShow === 'sub-category') {
      handleShowNextComponent(item?.subCategories)
    } else if (item.nextToShow === 'questions') {
      handleShowNextComponent(item?.questions)
    } else if (item.nextToShow === 'questionType') {
      handleShowNextComponent(item?.questionValue, item.questionType, item.score)
    } else if  (item.nextToShow === 'sub-questions') {
      handleShowNextComponent(item?.subQuestions)
    } else {
      // TODO: need to show alert
    }
  }

  // const handleQuestionType = (item: any) => {
  //   if (item.questionType === "text" || item.questionType === "image" || item.questionType === "doc") {
  //     handleShowNextComponent(item?.questionValue, item.questionType)
  //   } else if (item.questionType === "dropdown") {

  //   } // need to handle other cases.
  // }

  return (
        <div
          style={getDragWrapper(theme, `4px`)}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: -0.75 }}>
            <Typography
              onClick={() => handleClickItem(item)}
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                width: 'calc(100% - 34px)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                verticalAlign: 'middle',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item?.name}
            </Typography>

            <IconButton size="small" color="secondary" onClick={handleClickEdit} aria-controls="menu-comment" aria-haspopup="true">
              <EditOutlined style={{ color: theme.palette.primary.main }} />
            </IconButton>
            <IconButton size="small" color="secondary" onClick={handleClick} aria-controls="menu-comment" aria-haspopup="true">
              <DeleteOutlined style={{ color: theme.palette.error.main }} />
            </IconButton>

              {/* <AlertItemDelete title={item?.name} open={Boolean(anchorEl)} handleClose={handleClose} />
              <AlertItemEdit itemTitle={item?.name} open={Boolean(anchorElEdit)} handleClose={handleCloseEdit} /> */}
          </Stack>
        </div>
  );
};

export default Items;
