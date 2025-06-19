"use client"
import { ChangeEvent, KeyboardEvent, useState } from 'react';

// material-ui
import { Button, Grid, TextField, Stack, Tooltip, Box } from '@mui/material';

// third-party

// project imports
import SubCard from '../MainCard';
import IconButton from '../@extended/IconButton';

// assets
import { CalculatorOutlined, CloseOutlined, TeamOutlined } from '@ant-design/icons';


interface Props {
  columnId: string;
  name: string;
}

// ==============================|| KANBAN BOARD - ADD ITEM ||============================== //

const AddItem = ({ columnId, name }: Props) => {
  const [addTaskBox, setAddTaskBox] = useState(false);
  const handleAddTaskChange = () => {
    setAddTaskBox((prev) => !prev);
  };

  const [title, setTitle] = useState('');
  const [isTitle, setIsTitle] = useState(false);

  const handleTaskTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    if (newTitle.length <= 0) {
      setIsTitle(true);
    } else {
      setIsTitle(false);
    }
  };

  return (
    <Grid container alignItems="center" spacing={1} sx={{ marginTop: 1 }}>
      {addTaskBox && (
        <Grid item xs={12}>
          <SubCard content={false}>
            <Box sx={{ p: 2, pb: 1.5, transition: 'background-color 0.25s ease-out' }}>
              <Grid container alignItems="center" spacing={0.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Add Task"
                    value={title}
                    onChange={handleTaskTitle}
                    sx={{
                      mb: 3,
                      '& input': { bgcolor: 'transparent', p: 0, borderRadius: '0px' },
                      '& fieldset': { display: 'none' },
                      '& .MuiFormHelperText-root': {
                        ml: 0
                      },
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'transparent',
                        '&.Mui-focused': {
                          boxShadow: 'none'
                        }
                      }
                    }}
                    onKeyUp={() => console.log("keyup")}
                    helperText={isTitle ? 'Task title is required.' : ''}
                    error={isTitle}
                  />
                </Grid>
                <Grid item xs zeroMinWidth />
                <Grid item>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Cancel">
                      <IconButton size="small" color="error" onClick={handleAddTaskChange}>
                        <CloseOutlined />
                      </IconButton>
                    </Tooltip>
                    <Button variant="contained" color="primary" onClick={() => console.log("clicked on add task")} size="small">
                      Add
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </SubCard>
        </Grid>
      )}
      {!addTaskBox && (
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" fullWidth onClick={handleAddTaskChange}>
            Add {name}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default AddItem;
